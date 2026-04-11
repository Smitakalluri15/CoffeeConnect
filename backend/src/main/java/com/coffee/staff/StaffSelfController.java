package com.coffee.staff;

import com.coffee.booking.BookingResponse;
import com.coffee.menu.MenuCategoryRequest;
import com.coffee.menu.MenuCategoryResponse;
import com.coffee.menu.MenuItemAvailabilityRequest;
import com.coffee.menu.MenuItemRequest;
import com.coffee.menu.MenuItemResponse;
import com.coffee.order.OrderStatus;
import jakarta.validation.Valid;
import java.util.List;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.security.core.userdetails.UserDetails;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.PatchMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.PutMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

@RestController
@RequestMapping("/api/staff")
@PreAuthorize("hasAnyRole('CHEF','WAITER')")
public class StaffSelfController {
	private final StaffService staffService;

	public StaffSelfController(StaffService staffService) {
		this.staffService = staffService;
	}

	@GetMapping("/me")
	public ResponseEntity<StaffResponse> me(@AuthenticationPrincipal UserDetails userDetails) {
		return ResponseEntity.ok(staffService.getMyProfile(userDetails.getUsername()));
	}

	@GetMapping("/dashboard")
	public ResponseEntity<StaffDashboardResponse> dashboard(@AuthenticationPrincipal UserDetails userDetails) {
		return ResponseEntity.ok(staffService.getMyDashboard(userDetails.getUsername()));
	}

	@GetMapping("/menu/categories")
	@PreAuthorize("hasRole('CHEF')")
	public ResponseEntity<List<MenuCategoryResponse>> getChefMenu(@AuthenticationPrincipal UserDetails userDetails) {
		return ResponseEntity.ok(staffService.getChefMenuCategories(userDetails.getUsername()));
	}

	@PostMapping("/menu/categories")
	@PreAuthorize("hasRole('CHEF')")
	public ResponseEntity<MenuCategoryResponse> createChefMenuCategory(@AuthenticationPrincipal UserDetails userDetails,
			@Valid @RequestBody MenuCategoryRequest request) {
		return ResponseEntity.ok(staffService.createChefMenuCategory(userDetails.getUsername(), request));
	}

	@PostMapping("/menu/categories/{categoryId}/items")
	@PreAuthorize("hasRole('CHEF')")
	public ResponseEntity<MenuItemResponse> addChefMenuItem(@AuthenticationPrincipal UserDetails userDetails,
			@PathVariable Long categoryId, @Valid @RequestBody MenuItemRequest request) {
		return ResponseEntity.ok(staffService.addChefMenuItem(userDetails.getUsername(), categoryId, request));
	}

	@PutMapping("/menu/items/{itemId}")
	@PreAuthorize("hasRole('CHEF')")
	public ResponseEntity<MenuItemResponse> updateChefMenuItem(@AuthenticationPrincipal UserDetails userDetails,
			@PathVariable Long itemId, @Valid @RequestBody MenuItemRequest request) {
		return ResponseEntity.ok(staffService.updateChefMenuItem(userDetails.getUsername(), itemId, request));
	}

	@PatchMapping("/menu/items/{itemId}/availability")
	@PreAuthorize("hasRole('CHEF')")
	public ResponseEntity<MenuItemResponse> updateChefMenuItemAvailability(
			@AuthenticationPrincipal UserDetails userDetails, @PathVariable Long itemId,
			@Valid @RequestBody MenuItemAvailabilityRequest request) {
		return ResponseEntity.ok(
				staffService.updateChefMenuItemAvailability(userDetails.getUsername(), itemId, request.getAvailable()));
	}

	@PatchMapping("/orders/{orderId}/kitchen-status")
	@PreAuthorize("hasRole('CHEF')")
	public ResponseEntity<StaffKitchenOrderResponse> updateKitchenStatus(
			@AuthenticationPrincipal UserDetails userDetails, @PathVariable Long orderId,
			@Valid @RequestBody StaffOrderStatusRequest request) {
		return ResponseEntity
				.ok(staffService.updateKitchenOrderStatus(userDetails.getUsername(), orderId, request.getStatus()));
	}

	@PatchMapping("/orders/{orderId}/service")
	@PreAuthorize("hasRole('WAITER')")
	public ResponseEntity<StaffServiceOrderResponse> handleWaiterOrderAction(
			@AuthenticationPrincipal UserDetails userDetails, @PathVariable Long orderId,
			@Valid @RequestBody StaffOrderActionRequest request) {
		return ResponseEntity
				.ok(staffService.handleWaiterOrderAction(userDetails.getUsername(), orderId, request.getAction()));
	}

	@PatchMapping("/bookings/{bookingId}")
	@PreAuthorize("hasRole('WAITER')")
	public ResponseEntity<BookingResponse> updateBooking(@AuthenticationPrincipal UserDetails userDetails,
			@PathVariable Long bookingId, @Valid @RequestBody StaffBookingUpdateRequest request) {
		return ResponseEntity.ok(staffService.updateWaiterBooking(userDetails.getUsername(), bookingId, request));
	}
}
