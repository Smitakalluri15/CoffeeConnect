package com.coffee.menu;

import jakarta.validation.constraints.NotNull;

public class MenuItemAvailabilityRequest {
	@NotNull(message = "{menu.item.available.required}")
	private Boolean available;

	public Boolean getAvailable() {
		return available;
	}

	public void setAvailable(Boolean available) {
		this.available = available;
	}
}
