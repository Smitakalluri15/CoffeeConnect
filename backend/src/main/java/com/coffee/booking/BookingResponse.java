package com.coffee.booking;

import java.time.Instant;
import java.time.LocalDate;

public class BookingResponse {
	private final Long id;
	private final Long cafeOwnerId;
	private final String cafeName;
	private final LocalDate bookingDate;
	private final String timeSlot;
	private final Integer partySize;
	private final String seatingPreference;
	private final String notes;
	private final String assignedTable;
	private final BookingStatus status;
	private final String userEmail;
	private final Instant createdAt;

	public BookingResponse(Long id, Long cafeOwnerId, String cafeName, LocalDate bookingDate, String timeSlot,
			Integer partySize, String seatingPreference, String notes, String assignedTable, BookingStatus status,
			String userEmail, Instant createdAt) {
		this.id = id;
		this.cafeOwnerId = cafeOwnerId;
		this.cafeName = cafeName;
		this.bookingDate = bookingDate;
		this.timeSlot = timeSlot;
		this.partySize = partySize;
		this.seatingPreference = seatingPreference;
		this.notes = notes;
		this.assignedTable = assignedTable;
		this.status = status;
		this.userEmail = userEmail;
		this.createdAt = createdAt;
	}

	public Long getId() {
		return id;
	}

	public Long getCafeOwnerId() {
		return cafeOwnerId;
	}

	public String getCafeName() {
		return cafeName;
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

	public String getUserEmail() {
		return userEmail;
	}

	public Instant getCreatedAt() {
		return createdAt;
	}
}
