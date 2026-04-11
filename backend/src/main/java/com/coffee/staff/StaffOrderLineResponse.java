package com.coffee.staff;

import java.math.BigDecimal;

public class StaffOrderLineResponse {
	private final String itemName;
	private final Integer quantity;
	private final BigDecimal unitPrice;
	private final BigDecimal lineTotal;

	public StaffOrderLineResponse(String itemName, Integer quantity, BigDecimal unitPrice, BigDecimal lineTotal) {
		this.itemName = itemName;
		this.quantity = quantity;
		this.unitPrice = unitPrice;
		this.lineTotal = lineTotal;
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
