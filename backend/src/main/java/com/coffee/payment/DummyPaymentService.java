package com.coffee.payment;

import com.coffee.order.OrderPricingService;
import com.coffee.order.OrderPricingSummary;
import java.math.BigDecimal;
import java.math.RoundingMode;
import java.util.UUID;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.stereotype.Service;

@Service
public class DummyPaymentService {
	private final OrderPricingService orderPricingService;
	private final String currency;

	public DummyPaymentService(OrderPricingService orderPricingService,
			@Value("${app.payment.razorpay.currency:INR}") String currency) {
		this.orderPricingService = orderPricingService;
		this.currency = currency;
	}

	public DummyPaymentOrderResponse createOrder(RazorpayCreateOrderRequest request) {
		OrderPricingSummary pricing = orderPricingService.calculate(request.getCafeOwnerId(), request.getItems());
		long amountInSubunits = toSubunits(pricing.totalAmount());
		String orderId = "dummy_order_" + randomToken();
		String paymentId = "dummy_payment_" + randomToken();
		String signature = "dummy_signature_" + randomToken();
		String receipt = "dummy_receipt_" + randomToken().substring(0, 16);
		return new DummyPaymentOrderResponse("DUMMY", orderId, paymentId, signature, receipt, amountInSubunits,
				currency, pricing.cafeOwner().getCafeName(), pricing.totalAmount());
	}

	private long toSubunits(BigDecimal amount) {
		return amount.multiply(new BigDecimal("100")).setScale(0, RoundingMode.HALF_UP).longValueExact();
	}

	private String randomToken() {
		return UUID.randomUUID().toString().replace("-", "");
	}
}
