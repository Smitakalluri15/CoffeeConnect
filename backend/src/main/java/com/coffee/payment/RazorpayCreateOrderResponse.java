package com.coffee.payment;

import java.math.BigDecimal;

public class RazorpayCreateOrderResponse {
	private final String keyId;
	private final String orderId;
	private final long amount;
	private final String currency;
	private final String receipt;
	private final String cafeName;
	private final BigDecimal totalAmount;

	public RazorpayCreateOrderResponse(String keyId, String orderId, long amount, String currency, String receipt,
			String cafeName, BigDecimal totalAmount) {
		this.keyId = keyId;
		this.orderId = orderId;
		this.amount = amount;
		this.currency = currency;
		this.receipt = receipt;
		this.cafeName = cafeName;
		this.totalAmount = totalAmount;
	}

	public String getKeyId() {
		return keyId;
	}

	public String getOrderId() {
		return orderId;
	}

	public long getAmount() {
		return amount;
	}

	public String getCurrency() {
		return currency;
	}

	public String getReceipt() {
		return receipt;
	}

	public String getCafeName() {
		return cafeName;
	}

	public BigDecimal getTotalAmount() {
		return totalAmount;
	}
}
