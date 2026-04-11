package com.coffee.order;

import com.coffee.common.NotFoundException;
import com.coffee.payment.RazorpayQrPaymentStatusResponse;
import com.coffee.payment.RazorpayPaymentService;
import com.coffee.user.User;
import com.coffee.user.UserRepository;
import java.math.BigDecimal;
import java.math.RoundingMode;
import java.time.Instant;
import java.util.List;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

@Service
public class OrderServiceImpl implements OrderService {
	private final CafeOrderRepository orderRepository;
	private final UserRepository userRepository;
	private final OrderPricingService orderPricingService;
	private final RazorpayPaymentService razorpayPaymentService;
	private final String onlineProvider;

	public OrderServiceImpl(CafeOrderRepository orderRepository, UserRepository userRepository,
			OrderPricingService orderPricingService, RazorpayPaymentService razorpayPaymentService,
			@Value("${app.payment.online-provider:DUMMY}") String onlineProvider) {
		this.orderRepository = orderRepository;
		this.userRepository = userRepository;
		this.orderPricingService = orderPricingService;
		this.razorpayPaymentService = razorpayPaymentService;
		this.onlineProvider = normalizeProvider(onlineProvider);
	}

	@Override
	@Transactional
	public OrderResponse createOrder(String userEmail, OrderCreateRequest request) {
		User user = getUser(userEmail);
		OrderPricingSummary pricing = orderPricingService.calculate(request.getCafeOwnerId(), request.getItems());
		PaymentCaptureDetails paymentDetails = validatePayment(request, pricing);

		CafeOrder order = new CafeOrder();
		order.setUser(user);
		order.setCafeOwner(pricing.cafeOwner());
		order.setPaymentMethod(request.getPaymentMethod());
		order.setTableNumber(requireTrimmed(request.getTableNumber()));
		order.setCustomerName(requireTrimmed(request.getCustomerName()));
		order.setCustomerPhone(requireTrimmed(request.getCustomerPhone()));
		order.setCustomerEmail(normalizeEmail(user.getEmail()));
		order.setAddressLine(null);
		order.setLandmark(null);
		order.setDeliveryNotes(trimOptional(request.getDeliveryNotes()));
		order.setStatus(OrderStatus.CONFIRMED);
		applyPaymentMetadata(order, paymentDetails);

		order.setSubtotal(pricing.subtotal());
		order.setTaxAmount(pricing.taxAmount());
		order.setTotalAmount(pricing.totalAmount());
		order.setItems(toOrderItems(pricing.items(), order));

		CafeOrder saved = orderRepository.save(order);
		return toResponse(saved);
	}

	@Override
	@Transactional(readOnly = true)
	public List<OrderResponse> getMyOrders(String userEmail) {
		User user = getUser(userEmail);
		return orderRepository.findByUserOrderByCreatedAtDesc(user).stream().map(this::toResponse).toList();
	}

	@Override
	@Transactional(readOnly = true)
	public OrderResponse getMyOrder(String userEmail, Long orderId) {
		User user = getUser(userEmail);
		CafeOrder order = orderRepository.findByIdAndUser(orderId, user)
				.orElseThrow(() -> new NotFoundException("Order not found"));
		return toResponse(order);
	}

	private User getUser(String email) {
		String normalizedEmail = normalizeEmail(email);
		return userRepository.findByEmail(normalizedEmail).orElseThrow(() -> new NotFoundException("User not found"));
	}

	private List<CafeOrderItem> toOrderItems(List<PricedOrderItem> items, CafeOrder order) {
		return items.stream().map(item -> {
			CafeOrderItem orderItem = new CafeOrderItem();
			orderItem.setOrder(order);
			orderItem.setMenuItem(item.menuItem());
			orderItem.setItemName(item.menuItem().getName());
			orderItem.setQuantity(item.quantity());
			orderItem.setUnitPrice(item.unitPrice());
			orderItem.setLineTotal(item.lineTotal());
			return orderItem;
		}).toList();
	}

	private OrderResponse toResponse(CafeOrder order) {
		List<OrderItemResponse> items = order.getItems().stream()
				.map(item -> new OrderItemResponse(item.getId(),
						item.getMenuItem() == null ? null : item.getMenuItem().getId(), item.getItemName(),
						item.getQuantity(), item.getUnitPrice(), item.getLineTotal()))
				.toList();

		return new OrderResponse(order.getId(), order.getCafeOwner().getId(), order.getCafeOwner().getCafeName(),
				resolveStatus(order), order.getPaymentMethod(), order.getTableNumber(), order.getCustomerName(),
				order.getCustomerPhone(), order.getCustomerEmail(), order.getAddressLine(), order.getLandmark(),
				order.getDeliveryNotes(), order.getPaymentProvider(), order.getPaymentReceipt(),
				order.getPaymentOrderId(), order.getPaymentId(), order.isPaymentVerified(), order.getPaidAt(),
				order.getSubtotal(), order.getTaxAmount(), order.getTotalAmount(), items, order.getCreatedAt());
	}

	private OrderStatus resolveStatus(CafeOrder order) {
		return order.getStatus();
	}

	private String normalizeEmail(String email) {
		return email == null ? null : email.trim().toLowerCase();
	}

	private PaymentCaptureDetails validatePayment(OrderCreateRequest request, OrderPricingSummary pricing) {
		if (request.getPaymentMethod() != PaymentMethod.ONLINE) {
			return PaymentCaptureDetails.offline();
		}
		if ("DUMMY".equals(onlineProvider)) {
			validateDummyPayment(request);
			return new PaymentCaptureDetails("DUMMY", trimOptional(request.getRazorpayOrderId()),
					trimOptional(request.getRazorpayPaymentId()), trimOptional(request.getRazorpaySignature()),
					trimOptional(request.getRazorpayReceipt()), true, Instant.now());
		}
		String qrCodeId = trimOptional(request.getRazorpayQrCodeId());
		if (qrCodeId != null) {
			RazorpayQrPaymentStatusResponse qrStatus = razorpayPaymentService.getQrPaymentStatus(qrCodeId);
			if (!qrStatus.isPaymentCaptured()) {
				throw new IllegalArgumentException("QR payment is not completed yet");
			}
			if (qrStatus.getAmount() != toPaise(pricing.totalAmount())) {
				throw new IllegalArgumentException("QR payment amount does not match the order total");
			}
			return new PaymentCaptureDetails("RAZORPAY_QR", qrCodeId,
					firstNonBlank(qrStatus.getPaymentId(), request.getRazorpayPaymentId()), null,
					firstNonBlank(qrStatus.getReceipt(), request.getRazorpayReceipt()), true,
					qrStatus.getPaidAt() == null ? Instant.now() : qrStatus.getPaidAt());
		}
		razorpayPaymentService.verifySignature(request.getRazorpayOrderId(), request.getRazorpayPaymentId(),
				request.getRazorpaySignature());
		return new PaymentCaptureDetails(onlineProvider, trimOptional(request.getRazorpayOrderId()),
				trimOptional(request.getRazorpayPaymentId()), trimOptional(request.getRazorpaySignature()),
				trimOptional(request.getRazorpayReceipt()), true, Instant.now());
	}

	private void applyPaymentMetadata(CafeOrder order, PaymentCaptureDetails paymentDetails) {
		order.setPaymentProvider(paymentDetails.provider());
		order.setPaymentOrderId(paymentDetails.paymentOrderId());
		order.setPaymentId(paymentDetails.paymentId());
		order.setPaymentSignature(paymentDetails.paymentSignature());
		order.setPaymentReceipt(paymentDetails.paymentReceipt());
		order.setPaymentVerified(paymentDetails.paymentVerified());
		order.setPaidAt(paymentDetails.paidAt());
	}

	private String trimOptional(String value) {
		if (value == null) {
			return null;
		}
		String trimmed = value.trim();
		return trimmed.isEmpty() ? null : trimmed;
	}

	private String requireTrimmed(String value) {
		String trimmed = trimOptional(value);
		return trimmed == null ? "" : trimmed;
	}

	private String normalizeProvider(String provider) {
		if (provider == null || provider.isBlank()) {
			return "DUMMY";
		}
		return provider.trim().toUpperCase();
	}

	private void validateDummyPayment(OrderCreateRequest request) {
		String orderId = trimOptional(request.getRazorpayOrderId());
		String paymentId = trimOptional(request.getRazorpayPaymentId());
		String signature = trimOptional(request.getRazorpaySignature());
		if (orderId == null || paymentId == null || signature == null) {
			throw new IllegalArgumentException("Dummy payment verification values are required");
		}
	}

	private long toPaise(BigDecimal amount) {
		return amount.multiply(new BigDecimal("100")).setScale(0, RoundingMode.HALF_UP).longValueExact();
	}

	private String firstNonBlank(String primary, String fallback) {
		String primaryValue = trimOptional(primary);
		return primaryValue != null ? primaryValue : trimOptional(fallback);
	}

	private record PaymentCaptureDetails(String provider, String paymentOrderId, String paymentId,
			String paymentSignature, String paymentReceipt, boolean paymentVerified, Instant paidAt) {
		private static PaymentCaptureDetails offline() {
			return new PaymentCaptureDetails("OFFLINE", null, null, null, null, false, null);
		}
	}
}
