package com.coffee.staff;

import com.coffee.order.OrderStatus;
import com.coffee.order.PaymentMethod;
import java.math.BigDecimal;
import java.time.Instant;
import java.util.List;

public class StaffKitchenOrderResponse {
	private final Long id;
	private final String orderCode;
	private final OrderStatus status;
	private final String customerName;
	private final String customerPhone;
	private final String tableNumber;
	private final PaymentMethod paymentMethod;
	private final BigDecimal totalAmount;
	private final int itemCount;
	private final List<String> items;
	private final List<StaffOrderLineResponse> lineItems;
	private final String specialNotes;
	private final boolean delayed;
	private final boolean largeOrder;
	private final boolean specialRequest;
	private final Instant createdAt;

	public StaffKitchenOrderResponse(Long id, String orderCode, OrderStatus status, String customerName,
			String customerPhone, String tableNumber, PaymentMethod paymentMethod, BigDecimal totalAmount,
			int itemCount, List<String> items, List<StaffOrderLineResponse> lineItems, String specialNotes,
			boolean delayed, boolean largeOrder, boolean specialRequest, Instant createdAt) {
		this.id = id;
		this.orderCode = orderCode;
		this.status = status;
		this.customerName = customerName;
		this.customerPhone = customerPhone;
		this.tableNumber = tableNumber;
		this.paymentMethod = paymentMethod;
		this.totalAmount = totalAmount;
		this.itemCount = itemCount;
		this.items = items;
		this.lineItems = lineItems;
		this.specialNotes = specialNotes;
		this.delayed = delayed;
		this.largeOrder = largeOrder;
		this.specialRequest = specialRequest;
		this.createdAt = createdAt;
	}

	public Long getId() {
		return id;
	}

	public String getOrderCode() {
		return orderCode;
	}

	public OrderStatus getStatus() {
		return status;
	}

	public String getCustomerName() {
		return customerName;
	}

	public String getCustomerPhone() {
		return customerPhone;
	}

	public String getTableNumber() {
		return tableNumber;
	}

	public PaymentMethod getPaymentMethod() {
		return paymentMethod;
	}

	public BigDecimal getTotalAmount() {
		return totalAmount;
	}

	public int getItemCount() {
		return itemCount;
	}

	public List<String> getItems() {
		return items;
	}

	public List<StaffOrderLineResponse> getLineItems() {
		return lineItems;
	}

	public String getSpecialNotes() {
		return specialNotes;
	}

	public boolean isDelayed() {
		return delayed;
	}

	public boolean isLargeOrder() {
		return largeOrder;
	}

	public boolean isSpecialRequest() {
		return specialRequest;
	}

	public Instant getCreatedAt() {
		return createdAt;
	}
}
