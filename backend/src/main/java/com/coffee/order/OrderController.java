package com.coffee.order;

import jakarta.validation.Valid;
import java.util.List;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.security.core.userdetails.UserDetails;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

@RestController
@RequestMapping("/api/orders")
@PreAuthorize("hasRole('USER')")
public class OrderController {
	private final OrderService orderService;

	public OrderController(OrderService orderService) {
		this.orderService = orderService;
	}

	@PostMapping
	public ResponseEntity<OrderResponse> createOrder(@AuthenticationPrincipal UserDetails userDetails,
			@Valid @RequestBody OrderCreateRequest request) {
		return ResponseEntity.ok(orderService.createOrder(userDetails.getUsername(), request));
	}

	@GetMapping("/my")
	public ResponseEntity<List<OrderResponse>> getMyOrders(@AuthenticationPrincipal UserDetails userDetails) {
		return ResponseEntity.ok(orderService.getMyOrders(userDetails.getUsername()));
	}

	@GetMapping("/my/{orderId}")
	public ResponseEntity<OrderResponse> getMyOrder(@AuthenticationPrincipal UserDetails userDetails,
			@PathVariable Long orderId) {
		return ResponseEntity.ok(orderService.getMyOrder(userDetails.getUsername(), orderId));
	}
}
