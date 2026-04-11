package com.coffee.staff;

import jakarta.validation.constraints.NotNull;

public class StaffOrderActionRequest {
	@NotNull
	private StaffOrderAction action;

	public StaffOrderAction getAction() {
		return action;
	}

	public void setAction(StaffOrderAction action) {
		this.action = action;
	}
}
