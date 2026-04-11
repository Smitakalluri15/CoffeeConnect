package com.coffee.payment;

import java.time.Instant;

public class RazorpayQrPaymentStatusResponse {
	private final String qrCodeId;
	private final String imageUrl;
	private final String status;
	private final long amount;
	private final String currency;
	private final String receipt;
	private final boolean paymentCaptured;
	private final String paymentId;
	private final Instant paidAt;
	private final Long closeBy;
	private final Long closedAt;
	private final String closeReason;

	public RazorpayQrPaymentStatusResponse(String qrCodeId, String imageUrl, String status, long amount,
			String currency, String receipt, boolean paymentCaptured, String paymentId, Instant paidAt, Long closeBy,
			Long closedAt, String closeReason) {
		this.qrCodeId = qrCodeId;
		this.imageUrl = imageUrl;
		this.status = status;
		this.amount = amount;
		this.currency = currency;
		this.receipt = receipt;
		this.paymentCaptured = paymentCaptured;
		this.paymentId = paymentId;
		this.paidAt = paidAt;
		this.closeBy = closeBy;
		this.closedAt = closedAt;
		this.closeReason = closeReason;
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

	public boolean isPaymentCaptured() {
		return paymentCaptured;
	}

	public String getPaymentId() {
		return paymentId;
	}

	public Instant getPaidAt() {
		return paidAt;
	}

	public Long getCloseBy() {
		return closeBy;
	}

	public Long getClosedAt() {
		return closedAt;
	}

	public String getCloseReason() {
		return closeReason;
	}
}
