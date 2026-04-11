package com.coffee.user;

import com.coffee.notification.EmailService;
import java.util.UUID;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

@Service
public class UserProvisioningService {
	private final UserRepository userRepository;
	private final PasswordEncoder passwordEncoder;
	private final EmailService emailService;

	public UserProvisioningService(UserRepository userRepository, PasswordEncoder passwordEncoder,
			EmailService emailService) {
		this.userRepository = userRepository;
		this.passwordEncoder = passwordEncoder;
		this.emailService = emailService;
	}

	@Transactional
	public User createUser(String email, Role role) {
		String normalized = email.toLowerCase();
		if (userRepository.existsByEmail(normalized)) {
			throw new IllegalArgumentException("Email already registered");
		}

		String tempPassword = generateTempPassword();
		User user = new User();
		user.setEmail(normalized);
		user.setPasswordHash(passwordEncoder.encode(tempPassword));
		user.setRole(role);
		user.setActive(true);
		user.setEmailVerified(true);
		user.setMustResetPassword(true);

		User saved = userRepository.save(user);
		sendProvisionEmail(saved.getEmail(), tempPassword, role);
		return saved;
	}

	private void sendProvisionEmail(String email, String tempPassword, Role role) {
		String body = "Your account has been created as " + role + ".\n" + "Temporary password: " + tempPassword + "\n"
				+ "Please reset your password after login.";
		emailService.sendEmail(email, "Your account is ready", body);
	}

	private String generateTempPassword() {
		return UUID.randomUUID().toString().replace("-", "").substring(0, 10) + "!";
	}
}
