package com.coffee.payment;

import jakarta.validation.Valid;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.security.core.userdetails.UserDetails;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

@RestController
@RequestMapping("/api/payments")
@PreAuthorize("hasRole('USER')")
public class PaymentController {
	private final RazorpayPaymentService razorpayPaymentService;
	private final DummyPaymentService dummyPaymentService;

	public PaymentController(RazorpayPaymentService razorpayPaymentService, DummyPaymentService dummyPaymentService) {
		this.razorpayPaymentService = razorpayPaymentService;
		this.dummyPaymentService = dummyPaymentService;
	}

	@PostMapping("/razorpay/order")
	public ResponseEntity<RazorpayCreateOrderResponse> createRazorpayOrder(
			@AuthenticationPrincipal UserDetails userDetails, @Valid @RequestBody RazorpayCreateOrderRequest request) {
		RazorpayCreateOrderResponse response = razorpayPaymentService.createOrder(userDetails.getUsername(), request);
		return ResponseEntity.ok(response);
	}

	@PostMapping("/razorpay/qr")
	public ResponseEntity<RazorpayCreateQrCodeResponse> createRazorpayQr(
			@AuthenticationPrincipal UserDetails userDetails, @Valid @RequestBody RazorpayCreateOrderRequest request) {
		RazorpayCreateQrCodeResponse response = razorpayPaymentService.createQrCode(userDetails.getUsername(), request);
		return ResponseEntity.ok(response);
	}

	@GetMapping("/razorpay/qr/{qrCodeId}")
	public ResponseEntity<RazorpayQrPaymentStatusResponse> getRazorpayQrStatus(@PathVariable String qrCodeId) {
		return ResponseEntity.ok(razorpayPaymentService.getQrPaymentStatus(qrCodeId));
	}

	@PostMapping("/dummy/order")
	public ResponseEntity<DummyPaymentOrderResponse> createDummyOrder(
			@Valid @RequestBody RazorpayCreateOrderRequest request) {
		return ResponseEntity.ok(dummyPaymentService.createOrder(request));
	}
}
