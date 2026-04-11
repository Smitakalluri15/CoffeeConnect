package com.coffee.booking;

import jakarta.validation.constraints.Max;
import jakarta.validation.constraints.Min;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;
import jakarta.validation.constraints.Size;
import java.time.LocalDate;

public class BookingRequest {
	@NotNull(message = "{booking.cafe.required}")
	private Long cafeOwnerId;

	@NotNull(message = "{booking.date.required}")
	private LocalDate bookingDate;

	@NotBlank(message = "{booking.time.required}")
	private String timeSlot;

	@NotNull(message = "{booking.party.required}")
	@Min(value = 1, message = "{booking.party.min}")
	@Max(value = 20, message = "{booking.party.max}")
	private Integer partySize;

	@Size(max = 60, message = "{booking.preference.size}")
	private String seatingPreference;

	@Size(max = 300, message = "{booking.notes.size}")
	private String notes;

	public Long getCafeOwnerId() {
		return cafeOwnerId;
	}

	public void setCafeOwnerId(Long cafeOwnerId) {
		this.cafeOwnerId = cafeOwnerId;
	}

	public LocalDate getBookingDate() {
		return bookingDate;
	}

	public void setBookingDate(LocalDate bookingDate) {
		this.bookingDate = bookingDate;
	}

	public String getTimeSlot() {
		return timeSlot;
	}

	public void setTimeSlot(String timeSlot) {
		this.timeSlot = timeSlot;
	}

	public Integer getPartySize() {
		return partySize;
	}

	public void setPartySize(Integer partySize) {
		this.partySize = partySize;
	}

	public String getSeatingPreference() {
		return seatingPreference;
	}

	public void setSeatingPreference(String seatingPreference) {
		this.seatingPreference = seatingPreference;
	}

	public String getNotes() {
		return notes;
	}

	public void setNotes(String notes) {
		this.notes = notes;
	}
}
