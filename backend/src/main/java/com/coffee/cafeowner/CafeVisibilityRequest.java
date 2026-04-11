package com.coffee.cafeowner;

import jakarta.validation.constraints.NotNull;

public class CafeVisibilityRequest {
	@NotNull(message = "{cafe.owner.cafeVisible.required}")
	private Boolean cafeVisible;

	public Boolean getCafeVisible() {
		return cafeVisible;
	}

	public void setCafeVisible(Boolean cafeVisible) {
		this.cafeVisible = cafeVisible;
	}
}
