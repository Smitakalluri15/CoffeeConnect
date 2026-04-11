package com.coffee.admin;

import com.coffee.cafeowner.CafeOwnerMapper;
import com.coffee.cafeowner.CafeOwnerProfile;
import com.coffee.cafeowner.CafeOwnerProfileRepository;
import com.coffee.cafeowner.CafeOwnerResponse;
import com.coffee.cafeowner.CafeOwnerStatus;
import com.coffee.cafeowner.VerificationStatus;
import com.coffee.common.NotFoundException;
import com.coffee.user.Role;
import com.coffee.user.User;
import com.coffee.user.UserProvisioningService;
import com.coffee.user.UserRepository;
import com.coffee.user.UserResponse;
import java.lang.management.ManagementFactory;
import java.util.LinkedHashMap;
import java.util.List;
import java.util.Map;
import java.util.concurrent.TimeUnit;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

@Service
public class AdminService {
	private final UserRepository userRepository;
	private final UserProvisioningService provisioningService;
	private final CafeOwnerProfileRepository cafeOwnerProfileRepository;

	public AdminService(UserRepository userRepository, UserProvisioningService provisioningService,
			CafeOwnerProfileRepository cafeOwnerProfileRepository) {
		this.userRepository = userRepository;
		this.provisioningService = provisioningService;
		this.cafeOwnerProfileRepository = cafeOwnerProfileRepository;
	}

	@Transactional
	public UserResponse createOwner(CreateOwnerRequest request) {
		User owner = provisioningService.createUser(request.getEmail(), Role.CAFE_OWNER);
		return toResponse(owner);
	}

	@Transactional(readOnly = true)
	public List<UserResponse> listOwners() {
		return userRepository.findAll().stream().filter(user -> user.getRole() == Role.CAFE_OWNER).map(this::toResponse)
				.toList();
	}

	@Transactional(readOnly = true)
	public AdminStatsResponse getStats() {
		long totalUsers = userRepository.count();
		long activeUsers = userRepository.countByActive(true);
		long inactiveUsers = userRepository.countByActive(false);
		long pendingUsers = userRepository.countByEmailVerified(false);

		Map<String, Long> roleCounts = new LinkedHashMap<>();
		for (Role role : Role.values()) {
			roleCounts.put(role.name(), userRepository.countByRole(role));
		}

		String uptime = formatUptime(ManagementFactory.getRuntimeMXBean().getUptime());
		return new AdminStatsResponse(totalUsers, activeUsers, inactiveUsers, pendingUsers, roleCounts, uptime);
	}

	@Transactional
	public UserResponse updateOwnerStatus(Long ownerId, boolean active) {
		User owner = userRepository.findById(ownerId).orElseThrow(() -> new NotFoundException("Owner not found"));
		if (owner.getRole() != Role.CAFE_OWNER) {
			throw new IllegalArgumentException("User is not a cafe owner");
		}
		owner.setActive(active);
		return toResponse(owner);
	}

	@Transactional(readOnly = true)
	public List<CafeOwnerResponse> listPendingCafeOwners() {
		return cafeOwnerProfileRepository.findByStatus(CafeOwnerStatus.PENDING).stream()
				.map(CafeOwnerMapper::toResponse).toList();
	}

	@Transactional
	public CafeOwnerResponse approveCafeOwner(Long ownerId) {
		CafeOwnerProfile profile = getCafeOwnerProfile(ownerId);
		applyApproval(profile);
		return CafeOwnerMapper.toResponse(profile);
	}

	@Transactional
	public CafeOwnerResponse rejectCafeOwner(Long ownerId, String reason) {
		CafeOwnerProfile profile = getCafeOwnerProfile(ownerId);
		applyRejection(profile, reason);
		return CafeOwnerMapper.toResponse(profile);
	}

	private UserResponse toResponse(User user) {
		return new UserResponse(user.getId(), user.getEmail(), user.getRole(), user.isActive(), user.isEmailVerified(),
				user.isMustResetPassword());
	}

	private CafeOwnerProfile getCafeOwnerProfile(Long ownerId) {
		return cafeOwnerProfileRepository.findById(ownerId)
				.orElseThrow(() -> new NotFoundException("Cafe owner not found"));
	}

	private void applyApproval(CafeOwnerProfile profile) {
		profile.setStatus(CafeOwnerStatus.ACTIVE);
		profile.setVerificationStatus(VerificationStatus.VERIFIED);
		profile.setRejectionReason(null);
	}

	private void applyRejection(CafeOwnerProfile profile, String reason) {
		profile.setStatus(CafeOwnerStatus.REJECTED);
		profile.setVerificationStatus(VerificationStatus.UNVERIFIED);
		profile.setRejectionReason(trimOptional(reason));
	}

	private String trimOptional(String value) {
		if (value == null) {
			return null;
		}
		String trimmed = value.trim();
		return trimmed.isEmpty() ? null : trimmed;
	}

	private String formatUptime(long uptimeMillis) {
		long totalSeconds = TimeUnit.MILLISECONDS.toSeconds(uptimeMillis);
		long days = totalSeconds / 86400;
		long hours = (totalSeconds % 86400) / 3600;
		long minutes = (totalSeconds % 3600) / 60;

		StringBuilder builder = new StringBuilder();
		if (days > 0) {
			builder.append(days).append("d ");
		}
		if (hours > 0 || days > 0) {
			builder.append(hours).append("h ");
		}
		builder.append(minutes).append("m");
		return builder.toString().trim();
	}
}
