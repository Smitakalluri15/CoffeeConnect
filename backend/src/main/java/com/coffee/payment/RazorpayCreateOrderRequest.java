package com.coffee.payment;

import com.coffee.order.OrderItemRequest;
import jakarta.validation.Valid;
import jakarta.validation.constraints.NotEmpty;
import jakarta.validation.constraints.NotNull;
import java.util.List;

public class RazorpayCreateOrderRequest {
	@NotNull(message = "{order.cafe.required}")
	private Long cafeOwnerId;

	@NotEmpty(message = "{order.items.required}")
	@Valid
	private List<OrderItemRequest> items;

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
}
