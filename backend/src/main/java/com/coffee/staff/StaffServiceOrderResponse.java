package com.coffee.staff;

import com.coffee.order.OrderStatus;
import com.coffee.order.PaymentMethod;
import java.math.BigDecimal;
import java.time.Instant;
import java.util.List;

public class StaffServiceOrderResponse {
	private final Long id;
	private final String orderCode;
	private final OrderStatus kitchenStatus;
	private final String serviceStage;
	private final String customerName;
	private final String customerPhone;
	private final String tableNumber;
	private final PaymentMethod paymentMethod;
	private final BigDecimal subtotal;
	private final BigDecimal taxAmount;
	private final BigDecimal totalAmount;
	private final List<String> items;
	private final List<StaffOrderLineResponse> lineItems;
	private final boolean billGenerated;
	private final boolean paymentInitiated;
	private final boolean paymentCompleted;
	private final Instant readyAt;
	private final Instant servedAt;
	private final Instant billGeneratedAt;
	private final Instant paymentInitiatedAt;
	private final Instant paidAt;
	private final Instant createdAt;

	public StaffServiceOrderResponse(Long id, String orderCode, OrderStatus kitchenStatus, String serviceStage,
			String customerName, String customerPhone, String tableNumber, PaymentMethod paymentMethod,
			BigDecimal subtotal, BigDecimal taxAmount, BigDecimal totalAmount, List<String> items,
			List<StaffOrderLineResponse> lineItems, boolean billGenerated, boolean paymentInitiated,
			boolean paymentCompleted, Instant readyAt, Instant servedAt, Instant billGeneratedAt,
			Instant paymentInitiatedAt, Instant paidAt, Instant createdAt) {
		this.id = id;
		this.orderCode = orderCode;
		this.kitchenStatus = kitchenStatus;
		this.serviceStage = serviceStage;
		this.customerName = customerName;
		this.customerPhone = customerPhone;
		this.tableNumber = tableNumber;
		this.paymentMethod = paymentMethod;
		this.subtotal = subtotal;
		this.taxAmount = taxAmount;
		this.totalAmount = totalAmount;
		this.items = items;
		this.lineItems = lineItems;
		this.billGenerated = billGenerated;
		this.paymentInitiated = paymentInitiated;
		this.paymentCompleted = paymentCompleted;
		this.readyAt = readyAt;
		this.servedAt = servedAt;
		this.billGeneratedAt = billGeneratedAt;
		this.paymentInitiatedAt = paymentInitiatedAt;
		this.paidAt = paidAt;
		this.createdAt = createdAt;
	}

	public Long getId() {
		return id;
	}

	public String getOrderCode() {
		return orderCode;
	}

	public OrderStatus getKitchenStatus() {
		return kitchenStatus;
	}

	public String getServiceStage() {
		return serviceStage;
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

	public BigDecimal getSubtotal() {
		return subtotal;
	}

	public BigDecimal getTaxAmount() {
		return taxAmount;
	}

	public BigDecimal getTotalAmount() {
		return totalAmount;
	}

	public List<String> getItems() {
		return items;
	}

	public List<StaffOrderLineResponse> getLineItems() {
		return lineItems;
	}

	public boolean isBillGenerated() {
		return billGenerated;
	}

	public boolean isPaymentInitiated() {
		return paymentInitiated;
	}

	public boolean isPaymentCompleted() {
		return paymentCompleted;
	}

	public Instant getReadyAt() {
		return readyAt;
	}

	public Instant getServedAt() {
		return servedAt;
	}

	public Instant getBillGeneratedAt() {
		return billGeneratedAt;
	}

	public Instant getPaymentInitiatedAt() {
		return paymentInitiatedAt;
	}

	public Instant getPaidAt() {
		return paidAt;
	}

	public Instant getCreatedAt() {
		return createdAt;
	}
}
