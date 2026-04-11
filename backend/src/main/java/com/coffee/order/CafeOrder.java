package com.coffee.order;

import com.coffee.cafeowner.CafeOwnerProfile;
import com.coffee.user.User;
import jakarta.persistence.CascadeType;
import jakarta.persistence.Column;
import jakarta.persistence.Entity;
import jakarta.persistence.EnumType;
import jakarta.persistence.Enumerated;
import jakarta.persistence.GeneratedValue;
import jakarta.persistence.GenerationType;
import jakarta.persistence.Id;
import jakarta.persistence.ManyToOne;
import jakarta.persistence.OneToMany;
import jakarta.persistence.PrePersist;
import jakarta.persistence.PreUpdate;
import jakarta.persistence.Table;
import java.math.BigDecimal;
import java.time.Instant;
import java.util.ArrayList;
import java.util.List;

@Entity
@Table(name = "cafe_orders")
public class CafeOrder {
	@Id
	@GeneratedValue(strategy = GenerationType.IDENTITY)
	private Long id;

	@ManyToOne(optional = false)
	private User user;

	@ManyToOne(optional = false)
	private CafeOwnerProfile cafeOwner;

	@Enumerated(EnumType.STRING)
	@Column(nullable = false, length = 20)
	private OrderStatus status;

	@Enumerated(EnumType.STRING)
	@Column(nullable = false, length = 20)
	private PaymentMethod paymentMethod;

	@Column(length = 20)
	private String tableNumber;

	@Column(nullable = false, length = 120)
	private String customerName;

	@Column(nullable = false, length = 20)
	private String customerPhone;

	@Column(length = 255)
	private String customerEmail;

	@Column(length = 255)
	private String addressLine;

	@Column(length = 160)
	private String landmark;

	@Column(length = 300)
	private String deliveryNotes;

	@Column(length = 30)
	private String paymentProvider;

	@Column(length = 80)
	private String paymentOrderId;

	@Column(length = 80)
	private String paymentId;

	@Column(length = 255)
	private String paymentSignature;

	@Column(length = 80)
	private String paymentReceipt;

	@Column
	private boolean paymentVerified;

	private Instant paidAt;
	private Instant readyAt;
	private Instant servedAt;
	private Instant billGeneratedAt;
	private Instant paymentInitiatedAt;

	@Column(nullable = false, precision = 10, scale = 2)
	private BigDecimal subtotal;

	@Column(nullable = false, precision = 10, scale = 2)
	private BigDecimal taxAmount;

	@Column(nullable = false, precision = 10, scale = 2)
	private BigDecimal totalAmount;

	@OneToMany(mappedBy = "order", cascade = CascadeType.ALL, orphanRemoval = true)
	private List<CafeOrderItem> items = new ArrayList<>();

	@Column(nullable = false, updatable = false)
	private Instant createdAt;

	@Column(nullable = false)
	private Instant updatedAt;

	@PrePersist
	void onCreate() {
		Instant now = Instant.now();
		createdAt = now;
		updatedAt = now;
	}

	@PreUpdate
	void onUpdate() {
		updatedAt = Instant.now();
	}

	public Long getId() {
		return id;
	}

	public User getUser() {
		return user;
	}

	public void setUser(User user) {
		this.user = user;
	}

	public CafeOwnerProfile getCafeOwner() {
		return cafeOwner;
	}

	public void setCafeOwner(CafeOwnerProfile cafeOwner) {
		this.cafeOwner = cafeOwner;
	}

	public OrderStatus getStatus() {
		return status;
	}

	public void setStatus(OrderStatus status) {
		this.status = status;
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

	public String getCustomerEmail() {
		return customerEmail;
	}

	public void setCustomerEmail(String customerEmail) {
		this.customerEmail = customerEmail;
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

	public String getPaymentProvider() {
		return paymentProvider;
	}

	public void setPaymentProvider(String paymentProvider) {
		this.paymentProvider = paymentProvider;
	}

	public String getPaymentOrderId() {
		return paymentOrderId;
	}

	public void setPaymentOrderId(String paymentOrderId) {
		this.paymentOrderId = paymentOrderId;
	}

	public String getPaymentId() {
		return paymentId;
	}

	public void setPaymentId(String paymentId) {
		this.paymentId = paymentId;
	}

	public String getPaymentSignature() {
		return paymentSignature;
	}

	public void setPaymentSignature(String paymentSignature) {
		this.paymentSignature = paymentSignature;
	}

	public String getPaymentReceipt() {
		return paymentReceipt;
	}

	public void setPaymentReceipt(String paymentReceipt) {
		this.paymentReceipt = paymentReceipt;
	}

	public boolean isPaymentVerified() {
		return paymentVerified;
	}

	public void setPaymentVerified(boolean paymentVerified) {
		this.paymentVerified = paymentVerified;
	}

	public Instant getPaidAt() {
		return paidAt;
	}

	public void setPaidAt(Instant paidAt) {
		this.paidAt = paidAt;
	}

	public Instant getReadyAt() {
		return readyAt;
	}

	public void setReadyAt(Instant readyAt) {
		this.readyAt = readyAt;
	}

	public Instant getServedAt() {
		return servedAt;
	}

	public void setServedAt(Instant servedAt) {
		this.servedAt = servedAt;
	}

	public Instant getBillGeneratedAt() {
		return billGeneratedAt;
	}

	public void setBillGeneratedAt(Instant billGeneratedAt) {
		this.billGeneratedAt = billGeneratedAt;
	}

	public Instant getPaymentInitiatedAt() {
		return paymentInitiatedAt;
	}

	public void setPaymentInitiatedAt(Instant paymentInitiatedAt) {
		this.paymentInitiatedAt = paymentInitiatedAt;
	}

	public BigDecimal getSubtotal() {
		return subtotal;
	}

	public void setSubtotal(BigDecimal subtotal) {
		this.subtotal = subtotal;
	}

	public BigDecimal getTaxAmount() {
		return taxAmount;
	}

	public void setTaxAmount(BigDecimal taxAmount) {
		this.taxAmount = taxAmount;
	}

	public BigDecimal getTotalAmount() {
		return totalAmount;
	}

	public void setTotalAmount(BigDecimal totalAmount) {
		this.totalAmount = totalAmount;
	}

	public List<CafeOrderItem> getItems() {
		return items;
	}

	public void setItems(List<CafeOrderItem> items) {
		this.items = items;
	}

	public Instant getCreatedAt() {
		return createdAt;
	}

	public Instant getUpdatedAt() {
		return updatedAt;
	}
}
