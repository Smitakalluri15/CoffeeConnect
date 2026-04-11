package com.coffee.order;

import jakarta.validation.Valid;
import jakarta.validation.constraints.NotEmpty;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;
import jakarta.validation.constraints.Pattern;
import jakarta.validation.constraints.Size;
import java.util.List;

public class OrderCreateRequest {
	@NotNull(message = "{order.cafe.required}")
	private Long cafeOwnerId;

	@NotEmpty(message = "{order.items.required}")
	@Valid
	private List<OrderItemRequest> items;

	@NotNull(message = "{order.payment.required}")
	private PaymentMethod paymentMethod;

	@NotBlank(message = "{order.table.required}")
	@Size(max = 20, message = "{order.table.size}")
	private String tableNumber;

	@NotBlank(message = "{order.customerName.required}")
	@Size(max = 120, message = "{order.customerName.size}")
	private String customerName;

	@NotBlank(message = "{order.customerPhone.required}")
	@Pattern(regexp = "^[0-9]{10}$", message = "{order.customerPhone.invalid}")
	private String customerPhone;

	@Size(max = 255, message = "{order.address.size}")
	private String addressLine;

	@Size(max = 160, message = "{order.landmark.size}")
	private String landmark;

	@Size(max = 300, message = "{order.notes.size}")
	private String deliveryNotes;

	@Size(max = 80, message = "{order.razorpay.orderId.size}")
	private String razorpayOrderId;

	@Size(max = 80, message = "{order.razorpay.paymentId.size}")
	private String razorpayPaymentId;

	@Size(max = 255, message = "{order.razorpay.signature.size}")
	private String razorpaySignature;

	@Size(max = 80, message = "{order.razorpay.qrCodeId.size}")
	private String razorpayQrCodeId;

	@Size(max = 80, message = "{order.receipt.size}")
	private String razorpayReceipt;

	public Long getCafeOwnerId() {
		return cafeOwnerId;
	}

	public void setCafeOwnerId(Long cafeOwnerId) {
		this.cafeOwnerId = cafeOwnerId;
	}

	public List<OrderItemRequest> getItems() {
		return items;
	}

	public void setItems(List<OrderItemRequest> items) {
		this.items = items;
	}

	public PaymentMethod getPaymentMethod() {
		return paymentMethod;
	}

	public void setPaymentMethod(PaymentMethod paymentMethod) {
		this.paymentMethod = paymentMethod;
	}

	public String getTableNumber() {
		return tableNumber;
	}

	public void setTableNumber(String tableNumber) {
		this.tableNumber = tableNumber;
	}

	public String getCustomerName() {
		return customerName;
	}

	public void setCustomerName(String customerName) {
		this.customerName = customerName;
	}

	public String getCustomerPhone() {
		return customerPhone;
	}

	public void setCustomerPhone(String customerPhone) {
		this.customerPhone = customerPhone;
	}

	public String getAddressLine() {
		return addressLine;
	}

	public void setAddressLine(String addressLine) {
		this.addressLine = addressLine;
	}

	public String getLandmark() {
		return landmark;
	}

	public void setLandmark(String landmark) {
		this.landmark = landmark;
	}

	public String getDeliveryNotes() {
		return deliveryNotes;
	}

	public void setDeliveryNotes(String deliveryNotes) {
		this.deliveryNotes = deliveryNotes;
	}

	public String getRazorpayOrderId() {
		return razorpayOrderId;
	}

	public void setRazorpayOrderId(String razorpayOrderId) {
		this.razorpayOrderId = razorpayOrderId;
	}

	public String getRazorpayPaymentId() {
		return razorpayPaymentId;
	}

	public void setRazorpayPaymentId(String razorpayPaymentId) {
		this.razorpayPaymentId = razorpayPaymentId;
	}

	public String getRazorpaySignature() {
		return razorpaySignature;
	}

	public void setRazorpaySignature(String razorpaySignature) {
		this.razorpaySignature = razorpaySignature;
	}

	public String getRazorpayQrCodeId() {
		return razorpayQrCodeId;
	}

	public void setRazorpayQrCodeId(String razorpayQrCodeId) {
		this.razorpayQrCodeId = razorpayQrCodeId;
	}

	public String getRazorpayReceipt() {
		return razorpayReceipt;
	}

	public void setRazorpayReceipt(String razorpayReceipt) {
		this.razorpayReceipt = razorpayReceipt;
	}
}
