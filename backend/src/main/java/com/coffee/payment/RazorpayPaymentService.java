package com.coffee.payment;

import com.coffee.order.OrderPricingService;
import com.coffee.order.OrderPricingSummary;
import com.fasterxml.jackson.core.type.TypeReference;
import com.fasterxml.jackson.databind.ObjectMapper;
import java.io.IOException;
import java.math.BigDecimal;
import java.math.RoundingMode;
import java.time.Duration;
import java.time.Instant;
import java.net.URI;
import java.net.http.HttpClient;
import java.net.http.HttpRequest;
import java.net.http.HttpResponse;
import java.nio.charset.StandardCharsets;
import java.security.MessageDigest;
import java.util.Base64;
import java.util.List;
import java.util.Map;
import javax.crypto.Mac;
import javax.crypto.spec.SecretKeySpec;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.stereotype.Service;

@Service
public class RazorpayPaymentService {
	private static final String CREATE_ORDER_URL = "https://api.razorpay.com/v1/orders";
	private static final String QR_CODES_URL = "https://api.razorpay.com/v1/payments/qr_codes";
	private static final TypeReference<Map<String, Object>> MAP_TYPE = new TypeReference<>() {
	};

	private final OrderPricingService orderPricingService;
	private final ObjectMapper objectMapper;
	private final HttpClient httpClient;
	private final String keyId;
	private final String keySecret;
	private final String currency;

	public RazorpayPaymentService(OrderPricingService orderPricingService, ObjectMapper objectMapper,
			@Value("${app.payment.razorpay.key-id:}") String keyId,
			@Value("${app.payment.razorpay.key-secret:}") String keySecret,
			@Value("${app.payment.razorpay.currency:INR}") String currency) {
		this.orderPricingService = orderPricingService;
		this.objectMapper = objectMapper;
		this.keyId = keyId;
		this.keySecret = keySecret;
		this.currency = currency;
		this.httpClient = HttpClient.newHttpClient();
	}

	public RazorpayCreateOrderResponse createOrder(String userEmail, RazorpayCreateOrderRequest request) {
		ensureConfigured();
		OrderPricingSummary pricing = orderPricingService.calculate(request.getCafeOwnerId(), request.getItems());
		long amountInPaise = toPaise(pricing.totalAmount());
		String receipt = buildReceipt(userEmail);
		Map<String, Object> payload = Map.of("amount", amountInPaise, "currency", currency, "receipt", receipt);
		Map<String, Object> body = callCreateOrderApi(payload);
		String razorpayOrderId = readRequired(body, "id");
		return new RazorpayCreateOrderResponse(keyId, razorpayOrderId, amountInPaise, currency, receipt,
				pricing.cafeOwner().getCafeName(), pricing.totalAmount());
	}

	public RazorpayCreateQrCodeResponse createQrCode(String userEmail, RazorpayCreateOrderRequest request) {
		ensureConfigured();
		OrderPricingSummary pricing = orderPricingService.calculate(request.getCafeOwnerId(), request.getItems());
		long amountInPaise = toPaise(pricing.totalAmount());
		String receipt = buildReceipt(userEmail);
		Map<String, Object> payload = Map.of("type", "upi_qr", "name", buildQrName(pricing.cafeOwner().getCafeName()),
				"usage", "single_use", "fixed_amount", true, "payment_amount", amountInPaise, "description",
				"Dine-in order payment for " + pricing.cafeOwner().getCafeName(), "close_by",
				Instant.now().plus(Duration.ofMinutes(15)).getEpochSecond(), "notes", Map.of("receipt", receipt));
		Map<String, Object> body = callPostApi(QR_CODES_URL, payload, "Razorpay QR creation failed");
		return new RazorpayCreateQrCodeResponse(readRequired(body, "id"), readRequired(body, "image_url"),
				readRequired(body, "status"), readRequiredLong(body, "payment_amount"), currency, receipt,
				pricing.cafeOwner().getCafeName(), pricing.totalAmount(), readOptionalLong(body, "close_by"));
	}

	public RazorpayQrPaymentStatusResponse getQrPaymentStatus(String qrCodeId) {
		ensureConfigured();
		String normalizedQrCodeId = requireTrimmed(qrCodeId, "QR code id is required");
		Map<String, Object> qrBody = callGetApi(QR_CODES_URL + "/" + normalizedQrCodeId, "Unable to fetch Razorpay QR");
		Map<String, Object> paymentsBody = callGetApi(QR_CODES_URL + "/" + normalizedQrCodeId + "/payments",
				"Unable to fetch Razorpay QR payments");

		List<Map<String, Object>> items = readItems(paymentsBody);
		Map<String, Object> capturedPayment = items.stream().filter(this::isCapturedPayment).findFirst().orElse(null);

		Map<String, Object> notes = readObject(qrBody.get("notes"));
		String receipt = readOptionalString(notes, "receipt");
		Instant paidAt = capturedPayment == null ? null : toInstant(readOptionalLong(capturedPayment, "created_at"));

		return new RazorpayQrPaymentStatusResponse(readRequired(qrBody, "id"), readRequired(qrBody, "image_url"),
				readRequired(qrBody, "status"), readRequiredLong(qrBody, "payment_amount"), currency, receipt,
				capturedPayment != null, capturedPayment == null ? null : readOptionalString(capturedPayment, "id"),
				paidAt, readOptionalLong(qrBody, "close_by"), readOptionalLong(qrBody, "closed_at"),
				readOptionalString(qrBody, "close_reason"));
	}

	public void verifySignature(String razorpayOrderId, String razorpayPaymentId, String razorpaySignature) {
		ensureConfigured();
		if (isBlank(razorpayOrderId) || isBlank(razorpayPaymentId) || isBlank(razorpaySignature)) {
			throw new IllegalArgumentException("Online payment verification is required");
		}
		String payload = razorpayOrderId + "|" + razorpayPaymentId;
		String expected = hmacSha256Hex(payload, keySecret);
		boolean matches = MessageDigest.isEqual(expected.getBytes(StandardCharsets.UTF_8),
				razorpaySignature.getBytes(StandardCharsets.UTF_8));
		if (!matches) {
			throw new IllegalArgumentException("Payment signature verification failed");
		}
	}

	private Map<String, Object> callCreateOrderApi(Map<String, Object> payload) {
		return callPostApi(CREATE_ORDER_URL, payload, "Razorpay order creation failed");
	}

	private Map<String, Object> callPostApi(String url, Map<String, Object> payload, String errorPrefix) {
		String requestBody = writeJson(payload);
		HttpRequest request = HttpRequest.newBuilder().uri(URI.create(url)).header("Authorization", basicAuthHeader())
				.header("Content-Type", "application/json").POST(HttpRequest.BodyPublishers.ofString(requestBody))
				.build();
		return parseGatewayResponse(send(request), errorPrefix);
	}

	private Map<String, Object> callGetApi(String url, String errorPrefix) {
		HttpRequest request = HttpRequest.newBuilder().uri(URI.create(url)).header("Authorization", basicAuthHeader())
				.GET().build();
		return parseGatewayResponse(send(request), errorPrefix);
	}

	private Map<String, Object> parseGatewayResponse(HttpResponse<String> response, String errorPrefix) {
		if (response.statusCode() < 200 || response.statusCode() >= 300) {
			String message = extractGatewayMessage(response.body());
			throw new IllegalArgumentException(errorPrefix + ": " + message);
		}
		return parseJson(response.body());
	}

	private HttpResponse<String> send(HttpRequest request) {
		try {
			return httpClient.send(request, HttpResponse.BodyHandlers.ofString());
		} catch (InterruptedException ex) {
			Thread.currentThread().interrupt();
			throw new IllegalArgumentException("Payment request was interrupted");
		} catch (IOException ex) {
			throw new IllegalArgumentException("Unable to reach Razorpay");
		}
	}

	private String writeJson(Map<String, Object> payload) {
		try {
			return objectMapper.writeValueAsString(payload);
		} catch (IOException ex) {
			throw new IllegalArgumentException("Failed to build payment request");
		}
	}

	private Map<String, Object> parseJson(String raw) {
		try {
			return objectMapper.readValue(raw, MAP_TYPE);
		} catch (IOException ex) {
			throw new IllegalArgumentException("Unexpected payment gateway response");
		}
	}

	private String extractGatewayMessage(String responseBody) {
		Map<String, Object> parsed = parseJson(responseBody);
		Object description = parsed.get("description");
		if (description instanceof String text && !text.isBlank()) {
			return text;
		}
		Object error = parsed.get("error");
		if (error instanceof Map<?, ?> errorMap) {
			Object nestedDescription = errorMap.get("description");
			if (nestedDescription instanceof String text && !text.isBlank()) {
				return text;
			}
		}
		return "Please try again";
	}

	private long toPaise(BigDecimal amount) {
		return amount.multiply(new BigDecimal("100")).setScale(0, RoundingMode.HALF_UP).longValueExact();
	}

	private String buildReceipt(String email) {
		String normalized = email == null ? "user" : email.trim().toLowerCase();
		String clean = normalized.replaceAll("[^a-z0-9]", "");
		if (clean.isBlank()) {
			clean = "user";
		}
		String receipt = "cc" + clean + System.currentTimeMillis();
		return receipt.length() > 40 ? receipt.substring(0, 40) : receipt;
	}

	private String buildQrName(String cafeName) {
		String base = (cafeName == null || cafeName.isBlank()) ? "CoffeeConnect QR" : cafeName.trim() + " QR";
		return base.length() > 40 ? base.substring(0, 40) : base;
	}

	private String basicAuthHeader() {
		String value = keyId + ":" + keySecret;
		String encoded = Base64.getEncoder().encodeToString(value.getBytes(StandardCharsets.UTF_8));
		return "Basic " + encoded;
	}

	private String readRequired(Map<String, Object> payload, String key) {
		Object value = payload.get(key);
		if (value instanceof String text && !text.isBlank()) {
			return text;
		}
		throw new IllegalArgumentException("Payment gateway did not return " + key);
	}

	private long readRequiredLong(Map<String, Object> payload, String key) {
		Long value = readOptionalLong(payload, key);
		if (value != null) {
			return value;
		}
		throw new IllegalArgumentException("Payment gateway did not return " + key);
	}

	private Long readOptionalLong(Map<String, Object> payload, String key) {
		Object value = payload.get(key);
		if (value instanceof Number number) {
			return number.longValue();
		}
		if (value instanceof String text && !text.isBlank()) {
			return Long.parseLong(text);
		}
		return null;
	}

	private String readOptionalString(Map<String, Object> payload, String key) {
		if (payload == null) {
			return null;
		}
		Object value = payload.get(key);
		if (value instanceof String text) {
			String trimmed = text.trim();
			return trimmed.isEmpty() ? null : trimmed;
		}
		return null;
	}

	@SuppressWarnings("unchecked")
	private List<Map<String, Object>> readItems(Map<String, Object> payload) {
		Object items = payload.get("items");
		if (items instanceof List<?> list) {
			return list.stream().filter(Map.class::isInstance).map(item -> (Map<String, Object>) item).toList();
		}
		return List.of();
	}

	@SuppressWarnings("unchecked")
	private Map<String, Object> readObject(Object value) {
		if (value instanceof Map<?, ?> map) {
			return (Map<String, Object>) map;
		}
		return Map.of();
	}

	private boolean isCapturedPayment(Map<String, Object> payment) {
		String status = readOptionalString(payment, "status");
		if ("captured".equalsIgnoreCase(status)) {
			return true;
		}
		Object captured = payment.get("captured");
		return captured instanceof Boolean value && value;
	}

	private Instant toInstant(Long epochSeconds) {
		return epochSeconds == null ? null : Instant.ofEpochSecond(epochSeconds);
	}

	private String requireTrimmed(String value, String message) {
		if (value == null) {
			throw new IllegalArgumentException(message);
		}
		String trimmed = value.trim();
		if (trimmed.isEmpty()) {
			throw new IllegalArgumentException(message);
		}
		return trimmed;
	}

	private String hmacSha256Hex(String payload, String secret) {
		try {
			Mac mac = Mac.getInstance("HmacSHA256");
			SecretKeySpec keySpec = new SecretKeySpec(secret.getBytes(StandardCharsets.UTF_8), "HmacSHA256");
			mac.init(keySpec);
			byte[] digest = mac.doFinal(payload.getBytes(StandardCharsets.UTF_8));
			StringBuilder hex = new StringBuilder(digest.length * 2);
			for (byte value : digest) {
				hex.append(String.format("%02x", value));
			}
			return hex.toString();
		} catch (Exception ex) {
			throw new IllegalArgumentException("Unable to verify payment signature");
		}
	}

	private void ensureConfigured() {
		if (isBlank(keyId) || isBlank(keySecret)) {
			throw new IllegalArgumentException("Razorpay is not configured on server");
		}
	}

	private boolean isBlank(String value) {
		return value == null || value.trim().isEmpty();
	}
}
