package com.coffee.order;

import java.math.BigDecimal;

public class OrderItemResponse {
	private final Long id;
	private final Long menuItemId;
	private final String itemName;
	private final Integer quantity;
	private final BigDecimal unitPrice;
	private final BigDecimal lineTotal;

	public OrderItemResponse(Long id, Long menuItemId, String itemName, Integer quantity, BigDecimal unitPrice,
			BigDecimal lineTotal) {
		this.id = id;
		this.menuItemId = menuItemId;
		this.itemName = itemName;
		this.quantity = quantity;
		this.unitPrice = unitPrice;
		this.lineTotal = lineTotal;
	}

	public Long getId() {
		return id;
	}

	public Long getMenuItemId() {
		return menuItemId;
	}

	public String getItemName() {
		return itemName;
	}

	public Integer getQuantity() {
		return quantity;
	}

	public BigDecimal getUnitPrice() {
		return unitPrice;
	}

	public BigDecimal getLineTotal() {
		return lineTotal;
	}
}
