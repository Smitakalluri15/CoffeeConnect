package com.coffee.profile;

import com.coffee.common.NotFoundException;
import com.coffee.user.User;
import com.coffee.user.UserRepository;
import java.util.Base64;
import java.util.List;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

@Service
public class ProfileService {
	private final ProfileRepository profileRepository;
	private final UserRepository userRepository;

	public ProfileService(ProfileRepository profileRepository, UserRepository userRepository) {
		this.profileRepository = profileRepository;
		this.userRepository = userRepository;
	}

	@Transactional(readOnly = true)
	public ProfileResponse getProfile(String email) {
		User user = findUser(email);
		Profile profile = profileRepository.findByUserId(user.getId())
				.orElseThrow(() -> new NotFoundException("Profile not found"));
		return toResponse(profile);
	}

	@Transactional(readOnly = true)
	public ProfileResponse getProfileByUserId(Long userId) {
		Profile profile = profileRepository.findByUserId(userId)
				.orElseThrow(() -> new NotFoundException("Profile not found"));
		return toResponse(profile);
	}

	@Transactional(readOnly = true)
	public ProfileReviewResponse getProfileReviewByUserId(Long userId) {
		Profile profile = profileRepository.findByUserId(userId)
				.orElseThrow(() -> new NotFoundException("Profile not found"));
		return toReviewResponse(profile);
	}

	@Transactional
	public ProfileResponse updateProfile(String email, ProfileRequest request) {
		User user = findUser(email);
		Profile profile = profileRepository.findByUserId(user.getId())
				.orElseThrow(() -> new NotFoundException("Profile not found"));

		if (request.getFirstName() != null) {
			profile.setFirstName(request.getFirstName());
		}
		if (request.getLastName() != null) {
			profile.setLastName(request.getLastName());
		}
		if (request.getDob() != null) {
			profile.setDob(request.getDob());
		}
		if (request.getGender() != null) {
			profile.setGender(request.getGender());
		}
		if (request.getContactNo() != null) {
			profile.setContactNo(request.getContactNo());
		}
		if (request.getMaritalStatus() != null) {
			profile.setMaritalStatus(request.getMaritalStatus());
		}
		if (request.getStreet() != null) {
			profile.setStreet(request.getStreet());
		}
		if (request.getPlotNo() != null) {
			profile.setPlotNo(request.getPlotNo());
		}
		if (request.getCity() != null) {
			profile.setCity(request.getCity());
		}
		if (request.getState() != null) {
			profile.setState(request.getState());
		}
		if (request.getPincode() != null) {
			profile.setPincode(request.getPincode());
		}
		if (request.getCountry() != null) {
			profile.setCountry(request.getCountry());
		}

		if (request.getAcademics() != null) {
			profile.getAcademicInfos().clear();
			for (AcademicInfoRequest academic : request.getAcademics()) {
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

		if (request.getWorkExperiences() != null) {
			profile.getWorkExperiences().clear();
			for (WorkExperienceRequest work : request.getWorkExperiences()) {
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

		profile.setCompletionPercent(calculateCompletion(profile));
		return toResponse(profile);
	}

	public int calculateCompletion(Profile profile) {
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

	private User findUser(String email) {
		return userRepository.findByEmail(email).orElseThrow(() -> new NotFoundException("User not found"));
	}

	private ProfileResponse toResponse(Profile profile) {
		List<AcademicInfoResponse> academics = profile.getAcademicInfos().stream()
				.map(info -> new AcademicInfoResponse(info.getId(), info.getInstitution(), info.getDegree(),
						info.getFieldOfStudy(), info.getStartYear(), info.getEndYear()))
				.toList();
		List<WorkExperienceResponse> work = profile.getWorkExperiences().stream()
				.map(exp -> new WorkExperienceResponse(exp.getId(), exp.getCompany(), exp.getTitle(),
						exp.getStartDate(), exp.getEndDate(), exp.getDescription()))
				.toList();
		return new ProfileResponse(profile.getId(), profile.getFirstName(), profile.getLastName(), profile.getDob(),
				profile.getGender(), profile.getContactNo(), profile.getMaritalStatus(), profile.getStreet(),
				profile.getPlotNo(), profile.getCity(), profile.getState(), profile.getPincode(), profile.getCountry(),
				profile.getCompletionPercent(), academics, work);
	}

	private ProfileReviewResponse toReviewResponse(Profile profile) {
		List<AcademicInfoResponse> academics = profile.getAcademicInfos().stream()
				.map(info -> new AcademicInfoResponse(info.getId(), info.getInstitution(), info.getDegree(),
						info.getFieldOfStudy(), info.getStartYear(), info.getEndYear()))
				.toList();
		List<WorkExperienceResponse> work = profile.getWorkExperiences().stream()
				.map(exp -> new WorkExperienceResponse(exp.getId(), exp.getCompany(), exp.getTitle(),
						exp.getStartDate(), exp.getEndDate(), exp.getDescription()))
				.toList();
		GovtProofResponse proof = null;
		if (profile.getGovtProof() != null) {
			GovtProof entity = profile.getGovtProof();
			String data = Base64.getEncoder().encodeToString(entity.getFileData());
			proof = new GovtProofResponse(entity.getId(), entity.getIdType(), entity.getIdNumber(),
					entity.getFileName(), entity.getFileType(), data);
		}
		return new ProfileReviewResponse(profile.getId(), profile.getFirstName(), profile.getLastName(),
				profile.getDob(), profile.getGender(), profile.getContactNo(), profile.getMaritalStatus(),
				profile.getStreet(), profile.getPlotNo(), profile.getCity(), profile.getState(), profile.getPincode(),
				profile.getCountry(), profile.getCompletionPercent(), academics, work, proof);
	}
}
