package com.coffee.order;

import java.math.BigDecimal;
import java.time.Instant;
import java.util.List;

public class OrderResponse {
	private final Long id;
	private final Long cafeOwnerId;
	private final String cafeName;
	private final OrderStatus status;
	private final PaymentMethod paymentMethod;
	private final String tableNumber;
	private final String customerName;
	private final String customerPhone;
	private final String customerEmail;
	private final String addressLine;
	private final String landmark;
	private final String deliveryNotes;
	private final String paymentProvider;
	private final String paymentReceipt;
	private final String paymentOrderId;
	private final String paymentId;
	private final boolean paymentVerified;
	private final Instant paidAt;
	private final BigDecimal subtotal;
	private final BigDecimal taxAmount;
	private final BigDecimal totalAmount;
	private final List<OrderItemResponse> items;
	private final Instant createdAt;

	public OrderResponse(Long id, Long cafeOwnerId, String cafeName, OrderStatus status, PaymentMethod paymentMethod,
			String tableNumber, String customerName, String customerPhone, String customerEmail, String addressLine,
			String landmark, String deliveryNotes, String paymentProvider, String paymentReceipt, String paymentOrderId,
			String paymentId, boolean paymentVerified, Instant paidAt, BigDecimal subtotal, BigDecimal taxAmount,
			BigDecimal totalAmount, List<OrderItemResponse> items, Instant createdAt) {
		this.id = id;
		this.cafeOwnerId = cafeOwnerId;
		this.cafeName = cafeName;
		this.status = status;
		this.paymentMethod = paymentMethod;
		this.tableNumber = tableNumber;
		this.customerName = customerName;
		this.customerPhone = customerPhone;
		this.customerEmail = customerEmail;
		this.addressLine = addressLine;
		this.landmark = landmark;
		this.deliveryNotes = deliveryNotes;
		this.paymentProvider = paymentProvider;
		this.paymentReceipt = paymentReceipt;
		this.paymentOrderId = paymentOrderId;
		this.paymentId = paymentId;
		this.paymentVerified = paymentVerified;
		this.paidAt = paidAt;
		this.subtotal = subtotal;
		this.taxAmount = taxAmount;
		this.totalAmount = totalAmount;
		this.items = items;
		this.createdAt = createdAt;
	}

	public Long getId() {
		return id;
	}

	public Long getCafeOwnerId() {
		return cafeOwnerId;
	}

	public String getCafeName() {
		return cafeName;
	}

	public OrderStatus getStatus() {
		return status;
	}

	public PaymentMethod getPaymentMethod() {
		return paymentMethod;
	}

	public String getTableNumber() {
		return tableNumber;
	}

	public String getCustomerName() {
		return customerName;
	}

	public String getCustomerPhone() {
		return customerPhone;
	}

	public String getCustomerEmail() {
		return customerEmail;
	}

	public String getAddressLine() {
		return addressLine;
	}

	public String getLandmark() {
		return landmark;
	}

	public String getDeliveryNotes() {
		return deliveryNotes;
	}

	public String getPaymentProvider() {
		return paymentProvider;
	}

	public String getPaymentReceipt() {
		return paymentReceipt;
	}

	public String getPaymentOrderId() {
		return paymentOrderId;
	}

	public String getPaymentId() {
		return paymentId;
	}

	public boolean isPaymentVerified() {
		return paymentVerified;
	}

	public Instant getPaidAt() {
		return paidAt;
	}

	public BigDecimal getSubtotal() {
		return subtotal;
	}

	public BigDecimal getTaxAmount() {
		return taxAmount;
	}

	public BigDecimal getTotalAmount() {
		return totalAmount;
	}

	public List<OrderItemResponse> getItems() {
		return items;
	}

	public Instant getCreatedAt() {
		return createdAt;
	}
}
