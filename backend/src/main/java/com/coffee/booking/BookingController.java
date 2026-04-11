package com.coffee.booking;

import jakarta.validation.Valid;
import java.util.List;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.security.core.userdetails.UserDetails;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

@RestController
@RequestMapping("/api/bookings")
@PreAuthorize("hasRole('USER')")
public class BookingController {
	private final BookingService bookingService;

	public BookingController(BookingService bookingService) {
		this.bookingService = bookingService;
	}

	@PostMapping
	public ResponseEntity<BookingResponse> createBooking(@AuthenticationPrincipal UserDetails userDetails,
			@Valid @RequestBody BookingRequest request) {
		return ResponseEntity.ok(bookingService.createBooking(userDetails.getUsername(), request));
	}

	@GetMapping("/my")
	public ResponseEntity<List<BookingResponse>> getMyBookings(@AuthenticationPrincipal UserDetails userDetails) {
		return ResponseEntity.ok(bookingService.getUserBookings(userDetails.getUsername()));
	}
}
