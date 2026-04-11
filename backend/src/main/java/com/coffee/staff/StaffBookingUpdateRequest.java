package com.coffee.staff;

import com.coffee.booking.BookingStatus;
import jakarta.validation.constraints.Size;

public class StaffBookingUpdateRequest {
	private BookingStatus status;

	@Size(max = 20)
	private String assignedTable;

	public BookingStatus getStatus() {
		return status;
	}

	public void setStatus(BookingStatus status) {
		this.status = status;
	}

	public String getAssignedTable() {
		return assignedTable;
	}

	public void setAssignedTable(String assignedTable) {
		this.assignedTable = assignedTable;
	}
}
