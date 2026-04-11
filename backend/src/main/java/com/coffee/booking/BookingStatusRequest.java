package com.coffee.booking;

import jakarta.validation.constraints.NotNull;

public class BookingStatusRequest {
	@NotNull(message = "{booking.status.required}")
	private BookingStatus status;

	public BookingStatus getStatus() {
		return status;
	}

	public void setStatus(BookingStatus status) {
		this.status = status;
	}
}
