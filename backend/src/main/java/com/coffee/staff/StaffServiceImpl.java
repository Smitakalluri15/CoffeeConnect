package com.coffee.staff;

import com.coffee.booking.BookingRepository;
import com.coffee.booking.BookingResponse;
import com.coffee.booking.BookingStatus;
import com.coffee.booking.CafeBooking;
import com.coffee.cafeowner.CafeOwnerProfile;
import com.coffee.cafeowner.CafeOwnerProfileRepository;
import com.coffee.cafeowner.CafeOwnerStatus;
import com.coffee.common.NotFoundException;
import com.coffee.menu.MenuCategoryRequest;
import com.coffee.menu.MenuCategoryResponse;
import com.coffee.menu.MenuItemRequest;
import com.coffee.menu.MenuItemResponse;
import com.coffee.menu.MenuService;
import com.coffee.order.CafeOrder;
import com.coffee.order.CafeOrderItem;
import com.coffee.order.CafeOrderRepository;
import com.coffee.order.OrderStatus;
import com.coffee.order.PaymentMethod;
import com.coffee.user.Role;
import com.coffee.user.User;
import com.coffee.user.UserRepository;
import java.io.IOException;
import java.io.InputStream;
import java.nio.file.Files;
import java.nio.file.Path;
import java.nio.file.Paths;
import java.nio.file.StandardCopyOption;
import java.time.Duration;
import java.time.Instant;
import java.time.LocalDate;
import java.util.Comparator;
import java.util.List;
import java.util.Set;
import java.util.UUID;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import org.springframework.web.multipart.MultipartFile;

@Service
public class StaffServiceImpl implements StaffService {
	private static final long MAX_IMAGE_SIZE_BYTES = 2 * 1024 * 1024;
	private static final Set<String> ALLOWED_EXTENSIONS = Set.of(".jpg", ".jpeg", ".png", ".webp");
	private static final Set<Role> STAFF_ROLES = Set.of(Role.CHEF, Role.WAITER);
	private static final Duration DELAYED_AFTER = Duration.ofMinutes(18);
	private static final int DEFAULT_TABLE_COUNT = 12;

	private final CafeOwnerProfileRepository cafeOwnerRepository;
	private final StaffProfileRepository staffProfileRepository;
	private final UserRepository userRepository;
	private final CafeOrderRepository orderRepository;
	private final BookingRepository bookingRepository;
	private final MenuService menuService;
	private final PasswordEncoder passwordEncoder;
	private final Path staffUploadDir;

	public StaffServiceImpl(CafeOwnerProfileRepository cafeOwnerRepository,
			StaffProfileRepository staffProfileRepository, UserRepository userRepository,
			CafeOrderRepository orderRepository, BookingRepository bookingRepository, MenuService menuService,
			PasswordEncoder passwordEncoder, @Value("${app.upload.base-dir:uploads}") String uploadBaseDir) {
		this.cafeOwnerRepository = cafeOwnerRepository;
		this.staffProfileRepository = staffProfileRepository;
		this.userRepository = userRepository;
		this.orderRepository = orderRepository;
		this.bookingRepository = bookingRepository;
		this.menuService = menuService;
		this.passwordEncoder = passwordEncoder;
		this.staffUploadDir = Paths.get(uploadBaseDir).toAbsolutePath().normalize().resolve("staff");
	}

	@Override
	@Transactional
	public StaffResponse createChef(String ownerEmail, ChefCreateRequest request) {
		CafeOwnerProfile owner = getActiveOwner(ownerEmail);
		User user = createStaffUser(request.getLoginId(), request.getPassword(), Role.CHEF);
		StaffProfile profile = new StaffProfile();
		profile.setCafeOwner(owner);
		profile.setUser(user);
		profile.setFullName(request.getFullName().trim());
		profile.setPhoneNumber(request.getPhoneNumber().trim());
		profile.setEmail(trimOptional(request.getEmail()));
		profile.setGender(trimOptional(request.getGender()));
		profile.setProfilePhotoUrl(trimOptional(request.getProfilePhotoUrl()));
		profile.setStatus(StaffStatus.ACTIVE);
		profile.setShift(request.getShift());
		profile.setExperience(trimOptional(request.getExperience()));
		profile.setSpecialization(trimOptional(request.getSpecialization()));
		profile.setSectionArea(null);
		return toResponse(staffProfileRepository.save(profile));
	}

	@Override
	@Transactional
	public StaffResponse createWaiter(String ownerEmail, WaiterCreateRequest request) {
		CafeOwnerProfile owner = getActiveOwner(ownerEmail);
		User user = createStaffUser(request.getLoginId(), request.getPassword(), Role.WAITER);
		StaffProfile profile = new StaffProfile();
		profile.setCafeOwner(owner);
		profile.setUser(user);
		profile.setFullName(request.getFullName().trim());
		profile.setPhoneNumber(request.getPhoneNumber().trim());
		profile.setEmail(trimOptional(request.getEmail()));
		profile.setGender(null);
		profile.setProfilePhotoUrl(trimOptional(request.getProfilePhotoUrl()));
		profile.setStatus(StaffStatus.ACTIVE);
		profile.setShift(request.getShift());
		profile.setExperience(null);
		profile.setSpecialization(null);
		profile.setSectionArea(trimOptional(request.getSectionArea()));
		return toResponse(staffProfileRepository.save(profile));
	}

	@Override
	@Transactional(readOnly = true)
	public List<StaffResponse> listByOwner(String ownerEmail, Role roleFilter) {
		CafeOwnerProfile owner = getActiveOwner(ownerEmail);
		validateRoleFilter(roleFilter);
		List<StaffProfile> profiles = roleFilter == null
				? staffProfileRepository.findByCafeOwnerOrderByCreatedAtDesc(owner)
				: staffProfileRepository.findByCafeOwnerAndRole(owner, roleFilter);
		return profiles.stream().map(this::toResponse).toList();
	}

	@Override
	@Transactional
	public StaffResponse update(String ownerEmail, Long staffId, StaffUpdateRequest request) {
		StaffProfile profile = getOwnerStaff(ownerEmail, staffId);
		User user = profile.getUser();
		Role role = user.getRole();

		profile.setFullName(request.getFullName().trim());
		profile.setPhoneNumber(request.getPhoneNumber().trim());
		profile.setEmail(trimOptional(request.getEmail()));
		profile.setGender(trimOptional(request.getGender()));
		profile.setProfilePhotoUrl(trimOptional(request.getProfilePhotoUrl()));
		profile.setShift(request.getShift());
		applyRoleSpecificFields(profile, role, request);

		if (request.getLoginId() != null && !request.getLoginId().isBlank()) {
			String loginId = normalizeLoginId(request.getLoginId());
			if (!user.getEmail().equalsIgnoreCase(loginId)) {
				ensureLoginAvailable(loginId);
				user.setEmail(loginId);
			}
		}
		if (request.getPassword() != null && !request.getPassword().isBlank()) {
			user.setPasswordHash(passwordEncoder.encode(request.getPassword()));
			user.setMustResetPassword(false);
		}
		return toResponse(profile);
	}

	@Override
	@Transactional
	public StaffResponse updateStatus(String ownerEmail, Long staffId, StaffStatus status) {
		StaffProfile profile = getOwnerStaff(ownerEmail, staffId);
		profile.setStatus(status);
		profile.getUser().setActive(status == StaffStatus.ACTIVE);
		return toResponse(profile);
	}

	@Override
	@Transactional
	public void delete(String ownerEmail, Long staffId) {
		StaffProfile profile = getOwnerStaff(ownerEmail, staffId);
		User user = profile.getUser();
		staffProfileRepository.delete(profile);
		userRepository.delete(user);
	}

	@Override
	@Transactional(readOnly = true)
	public String uploadPhoto(String ownerEmail, MultipartFile file) {
		getActiveOwner(ownerEmail);
		validatePhoto(file);
		ensureUploadDirExists();
		String extension = resolveExtension(file.getOriginalFilename());
		String fileName = "staff_" + UUID.randomUUID() + extension;
		Path target = staffUploadDir.resolve(fileName).normalize();
		if (!target.startsWith(staffUploadDir)) {
			throw new IllegalArgumentException("Invalid image path");
		}
		copyFile(file, target);
		return "/uploads/staff/" + fileName;
	}

	@Override
	@Transactional(readOnly = true)
	public StaffResponse getMyProfile(String loginId) {
		return toResponse(getActiveStaffProfile(loginId));
	}

	@Override
	@Transactional(readOnly = true)
	public StaffDashboardResponse getMyDashboard(String loginId) {
		StaffProfile profile = getActiveStaffProfile(loginId);
		CafeOwnerProfile cafeOwner = profile.getCafeOwner();
		List<CafeOrder> cafeOrders = orderRepository.findByCafeOwnerOrderByCreatedAtAsc(cafeOwner);
		List<CafeBooking> todayBookings = getTodayBookings(cafeOwner);

		List<StaffKitchenOrderResponse> kitchenOrders = profile.getUser().getRole() == Role.CHEF
				? cafeOrders.stream().filter(this::showOnChefBoard).map(this::toKitchenOrderResponse).toList()
				: List.of();

		List<StaffKitchenOrderResponse> completedKitchenOrders = profile.getUser().getRole() == Role.CHEF ? cafeOrders
				.stream().filter(this::showOnChefHistory)
				.sorted(Comparator.comparing(CafeOrder::getCreatedAt, Comparator.nullsLast(Comparator.reverseOrder())))
				.map(this::toKitchenOrderResponse).toList() : List.of();

		List<StaffServiceOrderResponse> serviceOrders = profile.getUser().getRole() == Role.WAITER
				? cafeOrders.stream().filter(this::showOnWaiterBoard).map(this::toServiceOrderResponse).toList()
				: List.of();

		List<StaffServiceOrderResponse> completedServiceOrders = profile.getUser().getRole() == Role.WAITER ? cafeOrders
				.stream().filter(this::showOnWaiterHistory)
				.sorted(Comparator.comparing(this::waiterHistorySortTime,
						Comparator.nullsLast(Comparator.reverseOrder())))
				.map(this::toServiceOrderResponse).toList() : List.of();

		List<StaffBookingQueueResponse> bookings = profile.getUser().getRole() == Role.WAITER
				? todayBookings.stream().map(this::toBookingQueueResponse).toList()
				: List.of();

		return new StaffDashboardResponse(toResponse(profile), cafeOwner.getCafeName(), cafeOwner.getCity(),
				buildTableSummary(todayBookings), kitchenOrders, completedKitchenOrders, serviceOrders,
				completedServiceOrders, bookings);
	}

	@Override
	@Transactional(readOnly = true)
	public List<MenuCategoryResponse> getChefMenuCategories(String loginId) {
		StaffProfile chef = requireRole(loginId, Role.CHEF);
		return menuService.getCategories(chef.getCafeOwner());
	}

	@Override
	@Transactional
	public MenuCategoryResponse createChefMenuCategory(String loginId, MenuCategoryRequest request) {
		StaffProfile chef = requireRole(loginId, Role.CHEF);
		return menuService.createCategory(chef.getCafeOwner(), request);
	}

	@Override
	@Transactional
	public MenuItemResponse addChefMenuItem(String loginId, Long categoryId, MenuItemRequest request) {
		StaffProfile chef = requireRole(loginId, Role.CHEF);
		return menuService.addItem(chef.getCafeOwner(), categoryId, request);
	}

	@Override
	@Transactional
	public MenuItemResponse updateChefMenuItem(String loginId, Long itemId, MenuItemRequest request) {
		StaffProfile chef = requireRole(loginId, Role.CHEF);
		return menuService.updateItem(chef.getCafeOwner(), itemId, request);
	}

	@Override
	@Transactional
	public MenuItemResponse updateChefMenuItemAvailability(String loginId, Long itemId, boolean available) {
		StaffProfile chef = requireRole(loginId, Role.CHEF);
		return menuService.updateAvailability(chef.getCafeOwner(), itemId, available);
	}

	@Override
	@Transactional
	public StaffKitchenOrderResponse updateKitchenOrderStatus(String loginId, Long orderId, OrderStatus status) {
		StaffProfile chef = requireRole(loginId, Role.CHEF);
		if (status != OrderStatus.PREPARING && status != OrderStatus.READY) {
			throw new IllegalArgumentException("Chef can update only to PREPARING or READY");
		}

		CafeOrder order = getCafeOrder(chef.getCafeOwner(), orderId);
		validateChefTransition(order, status);
		order.setStatus(status);
		if (status == OrderStatus.READY) {
			order.setReadyAt(Instant.now());
		}
		return toKitchenOrderResponse(order);
	}

	@Override
	@Transactional
	public StaffServiceOrderResponse handleWaiterOrderAction(String loginId, Long orderId, StaffOrderAction action) {
		StaffProfile waiter = requireRole(loginId, Role.WAITER);
		CafeOrder order = getCafeOrder(waiter.getCafeOwner(), orderId);

		if (action == StaffOrderAction.SERVE) {
			markServed(order);
		} else if (action == StaffOrderAction.GENERATE_BILL) {
			generateBill(order);
		} else if (action == StaffOrderAction.INITIATE_PAYMENT) {
			initiatePayment(order);
		} else if (action == StaffOrderAction.COMPLETE_PAYMENT) {
			completePayment(order);
		}

		return toServiceOrderResponse(order);
	}

	@Override
	@Transactional
	public BookingResponse updateWaiterBooking(String loginId, Long bookingId, StaffBookingUpdateRequest request) {
		StaffProfile waiter = requireRole(loginId, Role.WAITER);
		CafeBooking booking = getCafeBooking(waiter.getCafeOwner(), bookingId);
		String assignedTable = trimOptional(request.getAssignedTable());
		BookingStatus status = request.getStatus();

		if (assignedTable == null && status == null) {
			throw new IllegalArgumentException("Provide a booking status or table assignment");
		}
		if (assignedTable != null) {
			booking.setAssignedTable(assignedTable);
		}
		if (status != null) {
			if (status == BookingStatus.SEATED && trimOptional(booking.getAssignedTable()) == null) {
				throw new IllegalArgumentException("Assign a table before seating the guest");
			}
			booking.setStatus(status);
		}
		return toBookingResponse(booking);
	}

	private void validateChefTransition(CafeOrder order, OrderStatus targetStatus) {
		if (order.getStatus() == OrderStatus.COMPLETED) {
			throw new IllegalArgumentException("Completed orders cannot return to kitchen");
		}
		if (targetStatus == OrderStatus.PREPARING && order.getStatus() != OrderStatus.CONFIRMED) {
			throw new IllegalArgumentException("Only new orders can move to PREPARING");
		}
		if (targetStatus == OrderStatus.READY && order.getStatus() != OrderStatus.PREPARING) {
			throw new IllegalArgumentException("Only PREPARING orders can move to READY");
		}
	}

	private void markServed(CafeOrder order) {
		if (order.getStatus() != OrderStatus.READY) {
			throw new IllegalArgumentException("Only READY orders can be served");
		}
		if (order.getServedAt() != null) {
			throw new IllegalArgumentException("Order is already marked as served");
		}
		if (order.getReadyAt() == null) {
			order.setReadyAt(order.getUpdatedAt() == null ? order.getCreatedAt() : order.getUpdatedAt());
		}
		order.setServedAt(Instant.now());
	}

	private void generateBill(CafeOrder order) {
		requireServed(order);
		if (order.getBillGeneratedAt() != null) {
			throw new IllegalArgumentException("Bill has already been generated");
		}
		order.setBillGeneratedAt(Instant.now());
	}

	private void initiatePayment(CafeOrder order) {
		requireBillGenerated(order);
		if (order.getPaymentMethod() == PaymentMethod.ONLINE && order.getPaidAt() != null) {
			throw new IllegalArgumentException("This order is already paid online");
		}
		if (order.getPaymentInitiatedAt() != null) {
			throw new IllegalArgumentException("Payment has already been initiated");
		}
		order.setPaymentInitiatedAt(Instant.now());
	}

	private void completePayment(CafeOrder order) {
		requireBillGenerated(order);
		if (order.getPaymentMethod() == PaymentMethod.PAY_AT_CAFE && order.getPaidAt() == null) {
			if (order.getPaymentInitiatedAt() == null) {
				order.setPaymentInitiatedAt(Instant.now());
			}
			order.setPaidAt(Instant.now());
			order.setPaymentVerified(true);
			if (trimOptional(order.getPaymentProvider()) == null) {
				order.setPaymentProvider("OFFLINE_SETTLED");
			}
		}
		if (order.getPaymentMethod() == PaymentMethod.ONLINE && order.getPaidAt() == null) {
			throw new IllegalArgumentException("Online payment is not completed");
		}
		order.setStatus(OrderStatus.COMPLETED);
	}

	private void requireServed(CafeOrder order) {
		if (order.getServedAt() == null) {
			throw new IllegalArgumentException("Serve the order before continuing");
		}
	}

	private void requireBillGenerated(CafeOrder order) {
		requireServed(order);
		if (order.getBillGeneratedAt() == null) {
			throw new IllegalArgumentException("Generate the bill before payment");
		}
	}

	private List<CafeBooking> getTodayBookings(CafeOwnerProfile cafeOwner) {
		LocalDate today = LocalDate.now();
		return bookingRepository.findByCafeOwnerOrderByBookingDateAsc(cafeOwner).stream()
				.filter(booking -> today.equals(booking.getBookingDate()))
				.sorted(Comparator.comparing(CafeBooking::getBookingDate).thenComparing(CafeBooking::getTimeSlot,
						Comparator.nullsLast(String::compareToIgnoreCase)))
				.toList();
	}

	private boolean showOnChefBoard(CafeOrder order) {
		return order.getStatus() == OrderStatus.CONFIRMED || order.getStatus() == OrderStatus.PREPARING
				|| order.getStatus() == OrderStatus.READY;
	}

	private boolean showOnChefHistory(CafeOrder order) {
		return order.getStatus() == OrderStatus.COMPLETED;
	}

	private boolean showOnWaiterBoard(CafeOrder order) {
		if (order.getStatus() == OrderStatus.COMPLETED) {
			return false;
		}
		return order.getStatus() == OrderStatus.READY || order.getServedAt() != null
				|| order.getBillGeneratedAt() != null;
	}

	private boolean showOnWaiterHistory(CafeOrder order) {
		return order.getServedAt() != null || order.getStatus() == OrderStatus.COMPLETED;
	}

	private StaffTableSummaryResponse buildTableSummary(List<CafeBooking> todayBookings) {
		int pending = (int) todayBookings.stream().filter(booking -> booking.getStatus() == BookingStatus.NEW).count();
		int reserved = (int) todayBookings.stream().filter(booking -> booking.getStatus() == BookingStatus.CONFIRMED)
				.count();
		int occupied = (int) todayBookings.stream().filter(booking -> booking.getStatus() == BookingStatus.SEATED)
				.count();
		int totalTables = Math.max(DEFAULT_TABLE_COUNT, pending + reserved + occupied);
		int availableTables = Math.max(totalTables - pending - reserved - occupied, 0);
		return new StaffTableSummaryResponse(totalTables, availableTables, reserved, occupied, pending);
	}

	private StaffKitchenOrderResponse toKitchenOrderResponse(CafeOrder order) {
		List<String> items = order.getItems().stream().map(this::formatOrderItem).toList();
		List<StaffOrderLineResponse> lineItems = order.getItems().stream()
				.map(item -> new StaffOrderLineResponse(item.getItemName(), item.getQuantity(), item.getUnitPrice(),
						item.getLineTotal()))
				.toList();
		int itemCount = totalQuantity(order);
		String notes = trimOptional(order.getDeliveryNotes());
		boolean specialRequest = notes != null;
		boolean largeOrder = itemCount >= 4;
		boolean delayed = isDelayed(order);
		return new StaffKitchenOrderResponse(order.getId(), orderCode(order.getId()), order.getStatus(),
				order.getCustomerName(), order.getCustomerPhone(), defaultTableLabel(order.getTableNumber()),
				order.getPaymentMethod(), order.getTotalAmount(), itemCount, items, lineItems, notes, delayed,
				largeOrder, specialRequest, order.getCreatedAt());
	}

	private StaffServiceOrderResponse toServiceOrderResponse(CafeOrder order) {
		List<String> items = order.getItems().stream().map(this::formatOrderItem).toList();
		List<StaffOrderLineResponse> lineItems = order.getItems().stream()
				.map(item -> new StaffOrderLineResponse(item.getItemName(), item.getQuantity(), item.getUnitPrice(),
						item.getLineTotal()))
				.toList();
		return new StaffServiceOrderResponse(order.getId(), orderCode(order.getId()), order.getStatus(),
				serviceStage(order), order.getCustomerName(), order.getCustomerPhone(),
				defaultTableLabel(order.getTableNumber()), order.getPaymentMethod(), order.getSubtotal(),
				order.getTaxAmount(), order.getTotalAmount(), items, lineItems, order.getBillGeneratedAt() != null,
				order.getPaymentInitiatedAt() != null, order.getPaidAt() != null, resolveReadyAt(order),
				order.getServedAt(), order.getBillGeneratedAt(), order.getPaymentInitiatedAt(), order.getPaidAt(),
				order.getCreatedAt());
	}

	private StaffBookingQueueResponse toBookingQueueResponse(CafeBooking booking) {
		return new StaffBookingQueueResponse(booking.getId(), booking.getUser().getEmail(), booking.getBookingDate(),
				booking.getTimeSlot(), booking.getPartySize(), booking.getSeatingPreference(), booking.getNotes(),
				booking.getAssignedTable(), booking.getStatus(), booking.getCreatedAt());
	}

	private BookingResponse toBookingResponse(CafeBooking booking) {
		return new BookingResponse(booking.getId(), booking.getCafeOwner().getId(),
				booking.getCafeOwner().getCafeName(), booking.getBookingDate(), booking.getTimeSlot(),
				booking.getPartySize(), booking.getSeatingPreference(), booking.getNotes(), booking.getAssignedTable(),
				booking.getStatus(), booking.getUser().getEmail(), booking.getCreatedAt());
	}

	private StaffProfile requireRole(String loginId, Role role) {
		StaffProfile profile = getActiveStaffProfile(loginId);
		if (profile.getUser().getRole() != role) {
			throw new IllegalArgumentException("This action is not allowed for your role");
		}
		return profile;
	}

	private StaffProfile getActiveStaffProfile(String loginId) {
		User user = userRepository.findByEmailIgnoreCase(normalizeLoginId(loginId))
				.orElseThrow(() -> new NotFoundException("Staff account not found"));
		if (!STAFF_ROLES.contains(user.getRole())) {
			throw new IllegalArgumentException("Only staff profiles are available on this endpoint");
		}
		StaffProfile profile = staffProfileRepository.findByUserId(user.getId())
				.orElseThrow(() -> new NotFoundException("Staff profile not found"));
		if (profile.getStatus() != StaffStatus.ACTIVE) {
			throw new IllegalArgumentException("Staff account is inactive");
		}
		requireActiveCafe(profile.getCafeOwner());
		return profile;
	}

	private CafeOwnerProfile getActiveOwner(String ownerEmail) {
		CafeOwnerProfile owner = cafeOwnerRepository.findByEmail(normalizeLoginId(ownerEmail))
				.orElseThrow(() -> new NotFoundException("Cafe owner not found"));
		requireActiveCafe(owner);
		return owner;
	}

	private void requireActiveCafe(CafeOwnerProfile owner) {
		if (owner.getStatus() != CafeOwnerStatus.ACTIVE) {
			throw new IllegalArgumentException("Cafe owner is not approved yet");
		}
	}

	private StaffProfile getOwnerStaff(String ownerEmail, Long staffId) {
		CafeOwnerProfile owner = getActiveOwner(ownerEmail);
		return staffProfileRepository.findByIdAndCafeOwner(staffId, owner)
				.orElseThrow(() -> new NotFoundException("Staff member not found"));
	}

	private CafeOrder getCafeOrder(CafeOwnerProfile cafeOwner, Long orderId) {
		return orderRepository.findByIdAndCafeOwner(orderId, cafeOwner)
				.orElseThrow(() -> new NotFoundException("Order not found"));
	}

	private CafeBooking getCafeBooking(CafeOwnerProfile cafeOwner, Long bookingId) {
		CafeBooking booking = bookingRepository.findById(bookingId)
				.orElseThrow(() -> new NotFoundException("Booking not found"));
		if (!booking.getCafeOwner().getId().equals(cafeOwner.getId())) {
			throw new IllegalArgumentException("Booking does not belong to your cafe");
		}
		return booking;
	}

	private User createStaffUser(String loginId, String password, Role role) {
		if (!STAFF_ROLES.contains(role)) {
			throw new IllegalArgumentException("Invalid staff role");
		}
		String normalizedLogin = normalizeLoginId(loginId);
		ensureLoginAvailable(normalizedLogin);

		User user = new User();
		user.setEmail(normalizedLogin);
		user.setPasswordHash(passwordEncoder.encode(password));
		user.setRole(role);
		user.setActive(true);
		user.setEmailVerified(true);
		user.setMustResetPassword(false);
		return userRepository.save(user);
	}

	private void applyRoleSpecificFields(StaffProfile profile, Role role, StaffUpdateRequest request) {
		if (role == Role.CHEF) {
			profile.setExperience(trimOptional(request.getExperience()));
			profile.setSpecialization(trimOptional(request.getSpecialization()));
			profile.setSectionArea(null);
		} else if (role == Role.WAITER) {
			profile.setSectionArea(trimOptional(request.getSectionArea()));
			profile.setExperience(null);
			profile.setSpecialization(null);
		}
	}

	private void validateRoleFilter(Role role) {
		if (role == null) {
			return;
		}
		if (!STAFF_ROLES.contains(role)) {
			throw new IllegalArgumentException("Role filter supports only CHEF or WAITER");
		}
	}

	private StaffResponse toResponse(StaffProfile profile) {
		return new StaffResponse(profile.getId(), profile.getCafeOwner().getId(), profile.getFullName(),
				profile.getPhoneNumber(), profile.getEmail(), profile.getGender(), profile.getProfilePhotoUrl(),
				profile.getUser().getEmail(), profile.getUser().getRole(), profile.getStatus(), profile.getShift(),
				profile.getExperience(), profile.getSpecialization(), profile.getSectionArea());
	}

	private String formatOrderItem(CafeOrderItem item) {
		return item.getItemName() + " x" + item.getQuantity();
	}

	private int totalQuantity(CafeOrder order) {
		return order.getItems().stream().map(CafeOrderItem::getQuantity).filter(quantity -> quantity != null)
				.mapToInt(Integer::intValue).sum();
	}

	private boolean isDelayed(CafeOrder order) {
		if (order.getCreatedAt() == null || order.getStatus() == OrderStatus.READY) {
			return false;
		}
		return Duration.between(order.getCreatedAt(), Instant.now()).compareTo(DELAYED_AFTER) >= 0;
	}

	private String serviceStage(CafeOrder order) {
		if (order.getStatus() == OrderStatus.COMPLETED) {
			return "COMPLETED";
		}
		if (order.getPaidAt() != null && order.getBillGeneratedAt() != null) {
			return "PAID";
		}
		if (order.getPaymentInitiatedAt() != null) {
			return "PAYMENT_PENDING";
		}
		if (order.getBillGeneratedAt() != null) {
			return "BILLED";
		}
		if (order.getServedAt() != null) {
			return "SERVED";
		}
		return "READY_TO_SERVE";
	}

	private Instant resolveReadyAt(CafeOrder order) {
		if (order.getReadyAt() != null) {
			return order.getReadyAt();
		}
		if (order.getStatus() == OrderStatus.READY || order.getServedAt() != null) {
			return order.getUpdatedAt();
		}
		return null;
	}

	private Instant waiterHistorySortTime(CafeOrder order) {
		if (order.getServedAt() != null) {
			return order.getServedAt();
		}
		if (order.getReadyAt() != null) {
			return order.getReadyAt();
		}
		return order.getCreatedAt();
	}

	private String orderCode(Long id) {
		return id == null ? "ORD" : String.format("ORD-%04d", id);
	}

	private String defaultTableLabel(String tableNumber) {
		String normalized = trimOptional(tableNumber);
		return normalized == null ? "Unassigned" : normalized;
	}

	private void ensureLoginAvailable(String loginId) {
		if (userRepository.existsByEmailIgnoreCase(loginId)) {
			throw new IllegalArgumentException("Login ID already exists");
		}
	}

	private String normalizeLoginId(String value) {
		return value == null ? null : value.trim().toLowerCase();
	}

	private String trimOptional(String value) {
		if (value == null) {
			return null;
		}
		String trimmed = value.trim();
		return trimmed.isEmpty() ? null : trimmed;
	}

	private void validatePhoto(MultipartFile file) {
		if (file == null || file.isEmpty()) {
			throw new IllegalArgumentException("Photo file is required");
		}
		if (file.getSize() > MAX_IMAGE_SIZE_BYTES) {
			throw new IllegalArgumentException("Photo must be 2MB or smaller");
		}
		String contentType = file.getContentType();
		if (contentType == null || !contentType.startsWith("image/")) {
			throw new IllegalArgumentException("Only image files are allowed");
		}
	}

	private String resolveExtension(String originalName) {
		if (originalName == null || !originalName.contains(".")) {
			return ".jpg";
		}
		String extension = originalName.substring(originalName.lastIndexOf(".")).toLowerCase();
		if (!ALLOWED_EXTENSIONS.contains(extension)) {
			throw new IllegalArgumentException("Supported formats: jpg, jpeg, png, webp");
		}
		return extension;
	}

	private void ensureUploadDirExists() {
		try {
			Files.createDirectories(staffUploadDir);
		} catch (IOException ex) {
			throw new IllegalArgumentException("Failed to prepare staff image storage");
		}
	}

	private void copyFile(MultipartFile file, Path target) {
		try (InputStream input = file.getInputStream()) {
			Files.copy(input, target, StandardCopyOption.REPLACE_EXISTING);
		} catch (IOException ex) {
			throw new IllegalArgumentException("Failed to store staff photo");
		}
	}
}
