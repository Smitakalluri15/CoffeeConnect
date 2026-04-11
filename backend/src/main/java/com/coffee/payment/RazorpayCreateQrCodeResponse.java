package com.coffee.payment;

import java.math.BigDecimal;

public class RazorpayCreateQrCodeResponse {
	private final String qrCodeId;
	private final String imageUrl;
	private final String status;
	private final long amount;
	private final String currency;
	private final String receipt;
	private final String cafeName;
	private final BigDecimal totalAmount;
	private final Long closeBy;

	public RazorpayCreateQrCodeResponse(String qrCodeId, String imageUrl, String status, long amount, String currency,
			String receipt, String cafeName, BigDecimal totalAmount, Long closeBy) {
		this.qrCodeId = qrCodeId;
		this.imageUrl = imageUrl;
		this.status = status;
		this.amount = amount;
		this.currency = currency;
		this.receipt = receipt;
		this.cafeName = cafeName;
		this.totalAmount = totalAmount;
		this.closeBy = closeBy;
	}

	public String getQrCodeId() {
		return qrCodeId;
	}

	public String getImageUrl() {
		return imageUrl;
	}

	public String getStatus() {
		return status;
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

	public Long getCloseBy() {
		return closeBy;
	}
}
