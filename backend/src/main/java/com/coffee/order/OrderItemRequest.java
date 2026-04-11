package com.coffee.order;

import jakarta.validation.constraints.Min;
import jakarta.validation.constraints.NotNull;

public class OrderItemRequest {
	@NotNull(message = "{order.item.required}")
	private Long menuItemId;

	@NotNull(message = "{order.quantity.required}")
	@Min(value = 1, message = "{order.quantity.min}")
	private Integer quantity;

	public Long getMenuItemId() {
		return menuItemId;
	}

	public void setMenuItemId(Long menuItemId) {
		this.menuItemId = menuItemId;
	}

	public Integer getQuantity() {
		return quantity;
	}

	public void setQuantity(Integer quantity) {
		this.quantity = quantity;
	}
}
