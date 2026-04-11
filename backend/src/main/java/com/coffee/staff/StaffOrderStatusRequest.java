package com.coffee.staff;

import com.coffee.order.OrderStatus;
import jakarta.validation.constraints.NotNull;

public class StaffOrderStatusRequest {
	@NotNull
	private OrderStatus status;

	public OrderStatus getStatus() {
		return status;
	}

	public void setStatus(OrderStatus status) {
		this.status = status;
	}
}
