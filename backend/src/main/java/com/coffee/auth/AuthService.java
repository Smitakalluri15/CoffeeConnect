package com.coffee.auth;

import com.coffee.common.NotFoundException;
import com.coffee.notification.EmailService;
import com.coffee.profile.AcademicInfo;
import com.coffee.profile.GovtProof;
import com.coffee.profile.GovtProofRequest;
import com.coffee.profile.Profile;
import com.coffee.profile.ProfileRepository;
import com.coffee.profile.ProfileRequest;
import com.coffee.profile.WorkExperience;
import com.coffee.user.Role;
import com.coffee.user.User;
import com.coffee.user.UserRepository;
import com.coffee.user.UserResponse;
import java.time.Instant;
import java.time.temporal.ChronoUnit;
import java.util.Map;
import java.util.Base64;
import java.util.UUID;
import org.springframework.security.authentication.BadCredentialsException;
import org.springframework.security.authentication.DisabledException;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.security.authentication.AuthenticationManager;
import org.springframework.security.authentication.UsernamePasswordAuthenticationToken;
import org.springframework.security.core.Authentication;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

@Service
public class AuthService {
	private final UserRepository userRepository;
	private final ProfileRepository profileRepository;
	private final VerificationTokenRepository verificationTokenRepository;
	private final PasswordResetTokenRepository passwordResetTokenRepository;
	private final PasswordEncoder passwordEncoder;
	private final AuthenticationManager authenticationManager;
	private final JwtService jwtService;
	private final EmailService emailService;
	private final String frontendBaseUrl;

	public AuthService(UserRepository userRepository, ProfileRepository profileRepository,
			VerificationTokenRepository verificationTokenRepository,
			PasswordResetTokenRepository passwordResetTokenRepository, PasswordEncoder passwordEncoder,
			AuthenticationManager authenticationManager, JwtService jwtService, EmailService emailService,
			@Value("${app.frontend.base-url}") String frontendBaseUrl) {
		this.userRepository = userRepository;
		this.profileRepository = profileRepository;
		this.verificationTokenRepository = verificationTokenRepository;
		this.passwordResetTokenRepository = passwordResetTokenRepository;
		this.passwordEncoder = passwordEncoder;
		this.authenticationManager = authenticationManager;
		this.jwtService = jwtService;
		this.emailService = emailService;
		this.frontendBaseUrl = frontendBaseUrl;
	}

	@Transactional
	public void registerCustomer(RegisterRequest request) {
		String normalized = request.getEmail().toLowerCase();
		if (userRepository.existsByEmail(normalized)) {
			throw new IllegalArgumentException("Email already registered");
		}

		User user = new User();
		user.setEmail(normalized);
		user.setPasswordHash(passwordEncoder.encode(request.getPassword()));
		user.setRole(Role.USER);
		user.setActive(false); // pending admin approval
		user.setEmailVerified(false);
		user.setMustResetPassword(false);

		User saved = userRepository.save(user);

		Profile profile = new Profile();
		profile.setUser(saved);
		applyProfileRequest(profile, request.getProfile());
		applyGovtProof(profile, request.getGovtProof());
		profile.setCompletionPercent(calculateCompletion(profile));
		profileRepository.save(profile);
		VerificationToken token = createVerificationToken(saved);
		sendVerificationEmail(saved.getEmail(), token.getToken(), null);
		sendPendingApprovalEmail(saved.getEmail());
	}

	public AuthResponse login(LoginRequest request) {
		String normalized = normalizeLoginId(request.getEmail());
		Authentication authentication;
		try {
			authentication = authenticationManager
					.authenticate(new UsernamePasswordAuthenticationToken(normalized, request.getPassword()));
		} catch (DisabledException ex) {
			User user = userRepository.findByEmailIgnoreCase(normalized).orElse(null);
			if (user != null && user.getRole() == Role.USER && !user.isEmailVerified()) {
				throw new IllegalArgumentException("Account pending admin approval");
			}
			throw new IllegalArgumentException("Account is inactive");
		} catch (BadCredentialsException ex) {
			throw new IllegalArgumentException("Invalid email or password");
		}

		String email = authentication.getName();
		User user = userRepository.findByEmailIgnoreCase(email)
				.orElseThrow(() -> new IllegalArgumentException("User not found"));
		if (!user.isActive()) {
			throw new IllegalArgumentException("Account is inactive");
		}
		if (!user.isEmailVerified()) {
			if (user.getRole() == Role.USER) {
				throw new IllegalArgumentException("Account pending admin approval");
			}
			throw new IllegalArgumentException("Email verification required");
		}

		String token = jwtService.generateToken(user.getEmail(), Map.of("role", user.getRole().name()));
		return new AuthResponse(token, toResponse(user));
	}

	@Transactional
	public void verifyEmail(String tokenValue) {
		VerificationToken token = verificationTokenRepository.findByToken(tokenValue)
				.orElseThrow(() -> new NotFoundException("Invalid verification token"));

		if (token.isUsed() || token.getExpiresAt().isBefore(Instant.now())) {
			throw new IllegalArgumentException("Verification token expired");
		}

		User user = token.getUser();
		user.setEmailVerified(true);
		token.setUsed(true);
	}

	@Transactional
	public void resendVerification(String email) {
		User user = userRepository.findByEmailIgnoreCase(normalizeLoginId(email))
				.orElseThrow(() -> new NotFoundException("User not found"));

		if (user.isEmailVerified()) {
			throw new IllegalArgumentException("Email already verified");
		}

		VerificationToken token = createVerificationToken(user);
		sendVerificationEmail(user.getEmail(), token.getToken(), null);
	}

	@Transactional
	public void changePassword(String email, ChangePasswordRequest request) {
		User user = userRepository.findByEmailIgnoreCase(normalizeLoginId(email))
				.orElseThrow(() -> new NotFoundException("User not found"));

		if (!passwordEncoder.matches(request.getCurrentPassword(), user.getPasswordHash())) {
			throw new IllegalArgumentException("Current password is incorrect");
		}

		user.setPasswordHash(passwordEncoder.encode(request.getNewPassword()));
		user.setMustResetPassword(false);
	}

	@Transactional
	public void requestPasswordReset(String email) {
		User user = userRepository.findByEmailIgnoreCase(normalizeLoginId(email))
				.orElseThrow(() -> new NotFoundException("User not found"));

		PasswordResetToken token = createPasswordResetToken(user);
		String link = frontendBaseUrl + "/reset-password?token=" + token.getToken();
		emailService.sendEmail(user.getEmail(), "Reset your password", "Use this link to reset your password: " + link);
	}

	@Transactional
	public void resetPassword(ResetPasswordRequest request) {
		PasswordResetToken token = passwordResetTokenRepository.findByToken(request.getToken())
				.orElseThrow(() -> new NotFoundException("Invalid reset token"));

		if (token.isUsed() || token.getExpiresAt().isBefore(Instant.now())) {
			throw new IllegalArgumentException("Reset token expired");
		}

		User user = token.getUser();
		user.setPasswordHash(passwordEncoder.encode(request.getNewPassword()));
		user.setMustResetPassword(false);
		token.setUsed(true);
	}

	private VerificationToken createVerificationToken(User user) {
		VerificationToken token = verificationTokenRepository.findByUserId(user.getId())
				.orElse(new VerificationToken());
		token.setUser(user);
		token.setToken(UUID.randomUUID().toString());
		token.setExpiresAt(Instant.now().plus(24, ChronoUnit.HOURS));
		token.setUsed(false);
		return verificationTokenRepository.save(token);
	}

	private PasswordResetToken createPasswordResetToken(User user) {
		PasswordResetToken token = passwordResetTokenRepository.findByUserId(user.getId())
				.orElse(new PasswordResetToken());
		token.setUser(user);
		token.setToken(UUID.randomUUID().toString());
		token.setExpiresAt(Instant.now().plus(2, ChronoUnit.HOURS));
		token.setUsed(false);
		return passwordResetTokenRepository.save(token);
	}

	private void sendVerificationEmail(String email, String token, String tempPassword) {
		String link = frontendBaseUrl + "/verify-email?token=" + token;
		StringBuilder body = new StringBuilder();
		body.append("Welcome to Coffee Order Management.\n");
		body.append("Verify your email using this link: ").append(link).append("\n");
		if (tempPassword != null) {
			body.append("Temporary password: ").append(tempPassword).append("\n");
			body.append("Please reset your password after logging in.\n");
		}
		emailService.sendEmail(email, "Verify your email", body.toString());
	}

	private void sendPendingApprovalEmail(String email) {
		String body = "Thanks for registering.\n"
				+ "Your profile is pending admin approval. You will be able to log in once approved.";
		emailService.sendEmail(email, "Registration received", body);
	}

	private String normalizeLoginId(String value) {
		return value == null ? null : value.trim().toLowerCase();
	}

	public UserResponse toResponse(User user) {
		return new UserResponse(user.getId(), user.getEmail(), user.getRole(), user.isActive(), user.isEmailVerified(),
				user.isMustResetPassword());
	}

	private void applyProfileRequest(Profile profile, ProfileRequest request) {
		if (request == null) {
			return;
		}
		profile.setFirstName(request.getFirstName());
		profile.setLastName(request.getLastName());
		profile.setDob(request.getDob());
		profile.setGender(request.getGender());
		profile.setContactNo(request.getContactNo());
		profile.setMaritalStatus(request.getMaritalStatus());
		profile.setStreet(request.getStreet());
		profile.setPlotNo(request.getPlotNo());
		profile.setCity(request.getCity());
		profile.setState(request.getState());
		profile.setPincode(request.getPincode());
		profile.setCountry(request.getCountry());

		profile.getAcademicInfos().clear();
		if (request.getAcademics() != null) {
			for (var academic : request.getAcademics()) {
				AcademicInfo info = new AcademicInfo();
				info.setProfile(profile);
				info.setInstitution(academic.getInstitution());
				info.setDegree(academic.getDegree());
				info.setFieldOfStudy(academic.getFieldOfStudy());
				info.setStartYear(academic.getStartYear());
				info.setEndYear(academic.getEndYear());
				profile.getAcademicInfos().add(info);
			}
		}

		profile.getWorkExperiences().clear();
		if (request.getWorkExperiences() != null) {
			for (var work : request.getWorkExperiences()) {
				WorkExperience exp = new WorkExperience();
				exp.setProfile(profile);
				exp.setCompany(work.getCompany());
				exp.setTitle(work.getTitle());
				exp.setStartDate(work.getStartDate());
				exp.setEndDate(work.getEndDate());
				exp.setDescription(work.getDescription());
				profile.getWorkExperiences().add(exp);
			}
		}
	}

	private void applyGovtProof(Profile profile, GovtProofRequest request) {
		if (request == null) {
			return;
		}
		GovtProof proof = new GovtProof();
		proof.setProfile(profile);
		proof.setIdType(request.getIdType());
		proof.setIdNumber(request.getIdNumber());
		proof.setFileName(request.getFileName());
		proof.setFileType(request.getFileType());
		proof.setFileData(decodeFileData(request.getFileData()));
		profile.setGovtProof(proof);
	}

	private byte[] decodeFileData(String fileData) {
		if (fileData == null || fileData.isBlank()) {
			return new byte[0];
		}
		String base64 = fileData;
		int comma = fileData.indexOf(',');
		if (comma >= 0) {
			base64 = fileData.substring(comma + 1);
		}
		return Base64.getDecoder().decode(base64);
	}

	private int calculateCompletion(Profile profile) {
		int total = 8;
		int filled = 0;
		if (isFilled(profile.getFirstName()))
			filled++;
		if (isFilled(profile.getLastName()))
			filled++;
		if (profile.getDob() != null)
			filled++;
		if (isFilled(profile.getGender()))
			filled++;
		if (isFilled(profile.getStreet()))
			filled++;
		if (isFilled(profile.getPlotNo()))
			filled++;
		if (isFilled(profile.getCity()))
			filled++;
		if (isFilled(profile.getPincode()))
			filled++;
		boolean hasAcademics = profile.getAcademicInfos() != null && !profile.getAcademicInfos().isEmpty();
		if (hasAcademics) {
			total += 1;
			filled += 1;
		} else {
			total += 1;
		}
		return (int) Math.round((filled * 100.0) / total);
	}

	private boolean isFilled(String value) {
		return value != null && !value.isBlank();
	}
}
