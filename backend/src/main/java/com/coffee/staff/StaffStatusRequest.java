package com.coffee.staff;

import jakarta.validation.constraints.NotNull;

public class StaffStatusRequest {
	@NotNull(message = "{staff.status.required}")
	private StaffStatus status;

	public StaffStatus getStatus() {
		return status;
	}

	public void setStatus(StaffStatus status) {
		this.status = status;
	}
}
