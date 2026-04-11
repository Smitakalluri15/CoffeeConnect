package com.coffee.order;

import java.util.List;

public interface OrderService {
	OrderResponse createOrder(String userEmail, OrderCreateRequest request);

	List<OrderResponse> getMyOrders(String userEmail);

	OrderResponse getMyOrder(String userEmail, Long orderId);
}
