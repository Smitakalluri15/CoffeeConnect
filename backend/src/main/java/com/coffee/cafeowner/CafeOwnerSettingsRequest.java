package com.coffee.cafeowner;

import jakarta.validation.constraints.DecimalMin;
import jakarta.validation.constraints.Min;
import jakarta.validation.constraints.NotNull;
import java.math.BigDecimal;

public class CafeOwnerSettingsRequest {
	@NotNull(message = "{cafe.owner.cafeVisible.required}")
	private Boolean cafeVisible;

	@NotNull(message = "{cafe.owner.ordersPaused.required}")
	private Boolean ordersPaused;

	@DecimalMin(value = "0.0", message = "{cafe.owner.minOrderValue.invalid}")
	private BigDecimal minOrderValue;

	@Min(value = 0, message = "{cafe.owner.prepTime.invalid}")
	private Integer prepTimeMinutes;

	public Boolean getCafeVisible() {
		return cafeVisible;
	}

	public void setCafeVisible(Boolean cafeVisible) {
		this.cafeVisible = cafeVisible;
	}

	public Boolean getOrdersPaused() {
		return ordersPaused;
	}

	public void setOrdersPaused(Boolean ordersPaused) {
		this.ordersPaused = ordersPaused;
	}

	public BigDecimal getMinOrderValue() {
		return minOrderValue;
	}

	public void setMinOrderValue(BigDecimal minOrderValue) {
		this.minOrderValue = minOrderValue;
	}

	public Integer getPrepTimeMinutes() {
		return prepTimeMinutes;
	}

	public void setPrepTimeMinutes(Integer prepTimeMinutes) {
		this.prepTimeMinutes = prepTimeMinutes;
	}
}
