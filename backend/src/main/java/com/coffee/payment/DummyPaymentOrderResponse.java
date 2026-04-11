package com.coffee.payment;

import java.math.BigDecimal;

public class DummyPaymentOrderResponse {
	private final String provider;
	private final String orderId;
	private final String paymentId;
	private final String signature;
	private final String receipt;
	private final long amount;
	private final String currency;
	private final String cafeName;
	private final BigDecimal totalAmount;

	public DummyPaymentOrderResponse(String provider, String orderId, String paymentId, String signature,
			String receipt, long amount, String currency, String cafeName, BigDecimal totalAmount) {
		this.provider = provider;
		this.orderId = orderId;
		this.paymentId = paymentId;
		this.signature = signature;
		this.receipt = receipt;
		this.amount = amount;
		this.currency = currency;
		this.cafeName = cafeName;
		this.totalAmount = totalAmount;
	}

	public String getProvider() {
		return provider;
	}

	public String getOrderId() {
		return orderId;
	}

	public String getPaymentId() {
		return paymentId;
	}

	public String getSignature() {
		return signature;
	}

	public String getReceipt() {
		return receipt;
	}

	public long getAmount() {
		return amount;
	}

	public String getCurrency() {
		return currency;
	}

	public String getCafeName() {
		return cafeName;
	}

	public BigDecimal getTotalAmount() {
		return totalAmount;
	}
}
