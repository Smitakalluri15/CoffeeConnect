package com.coffee.booking;

import java.util.List;

public interface BookingService {
	BookingResponse createBooking(String userEmail, BookingRequest request);

	List<BookingResponse> getUserBookings(String userEmail);

	List<BookingResponse> getOwnerBookings(String ownerEmail);

	BookingResponse updateStatus(String ownerEmail, Long bookingId, BookingStatus status);
}
