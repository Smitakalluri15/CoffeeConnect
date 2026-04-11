package com.coffee.booking;

import jakarta.validation.Valid;
import java.util.List;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.security.core.userdetails.UserDetails;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PatchMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

@RestController
@RequestMapping("/api/cafe-owner/bookings")
@PreAuthorize("hasRole('CAFE_OWNER')")
public class OwnerBookingController {
	private final BookingService bookingService;

	public OwnerBookingController(BookingService bookingService) {
		this.bookingService = bookingService;
	}

	@GetMapping
	public ResponseEntity<List<BookingResponse>> getOwnerBookings(@AuthenticationPrincipal UserDetails userDetails) {
		return ResponseEntity.ok(bookingService.getOwnerBookings(userDetails.getUsername()));
	}

	@PatchMapping("/{id}/status")
	public ResponseEntity<BookingResponse> updateStatus(@AuthenticationPrincipal UserDetails userDetails,
			@PathVariable Long id, @Valid @RequestBody BookingStatusRequest request) {
		return ResponseEntity.ok(bookingService.updateStatus(userDetails.getUsername(), id, request.getStatus()));
	}
}
