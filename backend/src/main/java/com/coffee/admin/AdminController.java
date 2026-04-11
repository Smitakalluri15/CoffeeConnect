package com.coffee.admin;

import com.coffee.cafeowner.CafeOwnerResponse;
import com.coffee.admin.CafeOwnerRejectionRequest;
import com.coffee.common.NotFoundException;
import com.coffee.profile.ProfileReviewResponse;
import com.coffee.profile.ProfileService;
import com.coffee.notification.EmailService;
import com.coffee.user.User;
import com.coffee.user.UserRepository;
import com.coffee.user.UserResponse;
import com.fasterxml.jackson.annotation.JsonProperty;
import jakarta.validation.Valid;
import java.lang.management.ManagementFactory;
import java.math.BigDecimal;
import java.time.Instant;
import java.time.LocalDate;
import java.time.ZoneId;
import java.time.format.DateTimeFormatter;
import java.util.ArrayList;
import java.util.Comparator;
import java.util.HashMap;
import java.util.List;
import java.util.Locale;
import java.util.Map;
import java.util.UUID;
import java.util.concurrent.TimeUnit;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.transaction.annotation.Transactional;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.web.bind.annotation.*;

@RestController
@RequestMapping("/api/admin")
@PreAuthorize("hasRole('ADMIN')")
public class AdminController {
	private static final ZoneId ZONE = ZoneId.systemDefault();
	private static final DateTimeFormatter DAY_FORMAT = DateTimeFormatter.ofPattern("MMM d", Locale.ENGLISH);

	private final AdminService adminService;
	private final UserRepository userRepository;
	private final ProfileService profileService;
	private final EmailService emailService;
	private final String frontendBaseUrl;
	private final PasswordEncoder passwordEncoder;

	public AdminController(AdminService adminService, UserRepository userRepository, ProfileService profileService,
			EmailService emailService, @Value("${app.frontend.base-url}") String frontendBaseUrl,
			PasswordEncoder passwordEncoder) {
		this.adminService = adminService;
		this.userRepository = userRepository;
		this.profileService = profileService;
		this.emailService = emailService;
		this.frontendBaseUrl = frontendBaseUrl;
		this.passwordEncoder = passwordEncoder;
	}

	@PostMapping("/owners")
	public ResponseEntity<UserResponse> createOwner(@Valid @RequestBody CreateOwnerRequest request) {
		return ResponseEntity.ok(adminService.createOwner(request));
	}

	@GetMapping("/owners")
	public ResponseEntity<List<UserResponse>> listOwners() {
		return ResponseEntity.ok(adminService.listOwners());
	}

	@GetMapping("/cafe-owners/pending")
	public ResponseEntity<List<CafeOwnerResponse>> listPendingCafeOwners() {
		return ResponseEntity.ok(adminService.listPendingCafeOwners());
	}

	@PutMapping("/cafe-owners/{id}/approve")
	public ResponseEntity<CafeOwnerResponse> approveCafeOwner(@PathVariable Long id) {
		return ResponseEntity.ok(adminService.approveCafeOwner(id));
	}

	@PutMapping("/cafe-owners/{id}/reject")
	public ResponseEntity<CafeOwnerResponse> rejectCafeOwner(@PathVariable Long id,
			@Valid @RequestBody(required = false) CafeOwnerRejectionRequest request) {
		String reason = request == null ? null : request.getReason();
		return ResponseEntity.ok(adminService.rejectCafeOwner(id, reason));
	}

	@PatchMapping("/owners/{id}/status")
	public ResponseEntity<UserResponse> updateOwnerStatus(@PathVariable Long id,
			@RequestBody UpdateStatusRequest request) {
		return ResponseEntity.ok(adminService.updateOwnerStatus(id, request.isActive()));
	}

	@GetMapping("/stats")
	public ResponseEntity<AdminStatsResponse> getStats() {
		long totalUsers = userRepository.count();
		long activeUsers = userRepository.countByStatus("ACTIVE");
		long pendingUsers = userRepository.countByStatus("PENDING");
		long inactiveUsers = userRepository.countByStatus("INACTIVE");
		String uptime = formatUptime(ManagementFactory.getRuntimeMXBean().getUptime());

		return ResponseEntity.ok(new AdminStatsResponse(totalUsers, activeUsers, pendingUsers, inactiveUsers, uptime));
	}

	@GetMapping("/pending-users")
	public ResponseEntity<List<UserResponse>> getPendingUsers() {
		List<User> pending = userRepository.findByStatus("PENDING");
		List<UserResponse> response = pending.stream().map(this::toResponse).toList();
		return ResponseEntity.ok(response);
	}

	@GetMapping("/users/{id}/profile")
	public ResponseEntity<ProfileReviewResponse> getUserProfile(@PathVariable Long id) {
		return ResponseEntity.ok(profileService.getProfileReviewByUserId(id));
	}

	@PutMapping("/approve/{id}")
	@Transactional
	public ResponseEntity<UserResponse> approveUser(@PathVariable Long id) {
		User user = userRepository.findById(id).orElseThrow(() -> new NotFoundException("User not found"));
		String tempPassword = generateTempPassword();
		user.setPasswordHash(passwordEncoder.encode(tempPassword));
		user.setEmailVerified(true);
		user.setActive(true);
		user.setMustResetPassword(true);
		userRepository.save(user);
		sendApprovalEmail(user, tempPassword);
		return ResponseEntity.ok(toResponse(user));
	}

	@PutMapping("/reject/{id}")
	@Transactional
	public ResponseEntity<UserResponse> rejectUser(@PathVariable Long id) {
		User user = userRepository.findById(id).orElseThrow(() -> new NotFoundException("User not found"));
		user.setActive(false);
		user.setEmailVerified(true);
		userRepository.save(user);
		sendRejectionEmail(user);
		return ResponseEntity.ok(toResponse(user));
	}

	@GetMapping("/users-activity")
	public ResponseEntity<UsersActivityResponse> getUsersActivity() {
		List<User> users = userRepository.findAll();
		UsersActivityResponse response = buildUsersActivity(users);
		return ResponseEntity.ok(response);
	}

	@GetMapping("/visitors")
	public ResponseEntity<VisitorsResponse> getVisitors() {
		List<User> users = userRepository.findAll();
		LocalDate today = LocalDate.now(ZONE);
		LocalDate cutoff = today.minusDays(29);

		long newUsers = users.stream().map(user -> toDate(user.getCreatedAt())).filter(date -> !date.isBefore(cutoff))
				.count();
		long returnedUsers = Math.max(users.size() - newUsers, 0);

		return ResponseEntity.ok(new VisitorsResponse(newUsers, returnedUsers));
	}

	@GetMapping("/sales")
	public ResponseEntity<SalesResponse> getSales() {
		LocalDate end = LocalDate.now(ZONE);
		LocalDate start = end.minusDays(6);

		Map<LocalDate, Long> ordersByDay = new HashMap<>();
		Map<LocalDate, BigDecimal> revenueByDay = new HashMap<>();

		List<String> labels = new ArrayList<>();
		List<Double> revenue = new ArrayList<>();
		List<Long> orders = new ArrayList<>();

		for (LocalDate cursor = start; !cursor.isAfter(end); cursor = cursor.plusDays(1)) {
			labels.add(DAY_FORMAT.format(cursor));
			revenue.add(revenueByDay.getOrDefault(cursor, BigDecimal.ZERO).doubleValue());
			orders.add(ordersByDay.getOrDefault(cursor, 0L));
		}

		return ResponseEntity.ok(new SalesResponse(labels, revenue, orders));
	}

	private UsersActivityResponse buildUsersActivity(List<User> users) {
		LocalDate end = LocalDate.now(ZONE);
		LocalDate start = end.minusDays(6);

		List<LocalDate> createdDates = users.stream().map(user -> toDate(user.getCreatedAt()))
				.sorted(Comparator.naturalOrder()).toList();

		Map<LocalDate, Long> newByDay = new HashMap<>();
		for (LocalDate date : createdDates) {
			newByDay.merge(date, 1L, Long::sum);
		}

		List<String> labels = new ArrayList<>();
		List<Long> newUsers = new ArrayList<>();
		List<Long> returningUsers = new ArrayList<>();

		int index = 0;
		int createdBefore = 0;

		for (LocalDate cursor = start; !cursor.isAfter(end); cursor = cursor.plusDays(1)) {
			while (index < createdDates.size() && createdDates.get(index).isBefore(cursor)) {
				createdBefore++;
				index++;
			}

			labels.add(DAY_FORMAT.format(cursor));
			newUsers.add(newByDay.getOrDefault(cursor, 0L));
			returningUsers.add((long) createdBefore);
		}

		return new UsersActivityResponse(labels, newUsers, returningUsers);
	}

	private LocalDate toDate(Instant instant) {
		return instant.atZone(ZONE).toLocalDate();
	}

	private UserResponse toResponse(User user) {
		return new UserResponse(user.getId(), user.getEmail(), user.getRole(), user.isActive(), user.isEmailVerified(),
				user.isMustResetPassword());
	}

	private void sendApprovalEmail(User user, String tempPassword) {
		String loginUrl = frontendBaseUrl + "/login";
		String body = "Dear " + user.getEmail() + ",\n\n"
				+ "Congratulations! Your account has been approved by the administrator.\n\n"
				+ "You can now login to your account using the following credentials:\n\n" + "Email: " + user.getEmail()
				+ "\n" + "Temporary Password (OTP): " + tempPassword + "\n\n"
				+ "For security reasons, you will be required to change your password on first login.\n" + "Login at: "
				+ loginUrl + "\n\n" + "Thank you for registering with CoffeeConnect!\n\n" + "Best regards,\n"
				+ "CoffeeConnect Team";
		emailService.sendEmail(user.getEmail(), "Your account is approved", body);
	}

	private void sendRejectionEmail(User user) {
		String body = "We reviewed your registration request.\n" + "Unfortunately, your account was not approved.\n"
				+ "If you believe this is a mistake, please contact support.";
		emailService.sendEmail(user.getEmail(), "Your account request was not approved", body);
	}

	private String generateTempPassword() {
		return UUID.randomUUID().toString().replace("-", "").substring(0, 10) + "!";
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

	public static class AdminStatsResponse {
		private final long totalUsers;
		private final long activeUsers;
		private final long pendingUsers;
		private final long inactiveUsers;
		private final String uptime;

		public AdminStatsResponse(long totalUsers, long activeUsers, long pendingUsers, long inactiveUsers,
				String uptime) {
			this.totalUsers = totalUsers;
			this.activeUsers = activeUsers;
			this.pendingUsers = pendingUsers;
			this.inactiveUsers = inactiveUsers;
			this.uptime = uptime;
		}

		public long getTotalUsers() {
			return totalUsers;
		}

		public long getActiveUsers() {
			return activeUsers;
		}

		public long getPendingUsers() {
			return pendingUsers;
		}

		public long getInactiveUsers() {
			return inactiveUsers;
		}

		public String getUptime() {
			return uptime;
		}
	}

	public static class UsersActivityResponse {
		private final List<String> labels;
		private final List<Long> newUsers;
		private final List<Long> returningUsers;

		public UsersActivityResponse(List<String> labels, List<Long> newUsers, List<Long> returningUsers) {
			this.labels = labels;
			this.newUsers = newUsers;
			this.returningUsers = returningUsers;
		}

		public List<String> getLabels() {
			return labels;
		}

		public List<Long> getNewUsers() {
			return newUsers;
		}

		public List<Long> getReturningUsers() {
			return returningUsers;
		}
	}

	public static class VisitorsResponse {
		private final long newUsers;
		private final long returnedUsers;

		public VisitorsResponse(long newUsers, long returnedUsers) {
			this.newUsers = newUsers;
			this.returnedUsers = returnedUsers;
		}

		@JsonProperty("new")
		public long getNewUsers() {
			return newUsers;
		}

		@JsonProperty("returned")
		public long getReturnedUsers() {
			return returnedUsers;
		}
	}

	public static class SalesResponse {
		private final List<String> labels;
		private final List<Double> revenue;
		private final List<Long> orders;

		public SalesResponse(List<String> labels, List<Double> revenue, List<Long> orders) {
			this.labels = labels;
			this.revenue = revenue;
			this.orders = orders;
		}

		public List<String> getLabels() {
			return labels;
		}

		public List<Double> getRevenue() {
			return revenue;
		}

		public List<Long> getOrders() {
			return orders;
		}
	}
}
