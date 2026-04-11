package com.coffee.menu;

import jakarta.validation.constraints.NotNull;

public class MenuCategoryStatusRequest {
	@NotNull(message = "{menu.category.active.required}")
	private Boolean active;

	public Boolean getActive() {
		return active;
	}

	public void setActive(Boolean active) {
		this.active = active;
	}
}
