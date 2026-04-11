package com.coffee.staff;

import com.coffee.booking.BookingStatus;
import java.time.Instant;
import java.time.LocalDate;

public class StaffBookingQueueResponse {
	private final Long id;
	private final String customerLabel;
	private final LocalDate bookingDate;
	private final String timeSlot;
	private final Integer partySize;
	private final String seatingPreference;
	private final String notes;
	private final String assignedTable;
	private final BookingStatus status;
	private final Instant createdAt;

	public StaffBookingQueueResponse(Long id, String customerLabel, LocalDate bookingDate, String timeSlot,
			Integer partySize, String seatingPreference, String notes, String assignedTable, BookingStatus status,
			Instant createdAt) {
		this.id = id;
		this.customerLabel = customerLabel;
		this.bookingDate = bookingDate;
		this.timeSlot = timeSlot;
		this.partySize = partySize;
		this.seatingPreference = seatingPreference;
		this.notes = notes;
		this.assignedTable = assignedTable;
		this.status = status;
		this.createdAt = createdAt;
	}

	public Long getId() {
		return id;
	}

	public String getCustomerLabel() {
		return customerLabel;
	}

	public LocalDate getBookingDate() {
		return bookingDate;
	}

	public String getTimeSlot() {
		return timeSlot;
	}

	public Integer getPartySize() {
		return partySize;
	}

	public String getSeatingPreference() {
		return seatingPreference;
	}

	public String getNotes() {
		return notes;
	}

	public String getAssignedTable() {
		return assignedTable;
	}

	public BookingStatus getStatus() {
		return status;
	}

	public Instant getCreatedAt() {
		return createdAt;
	}
}
