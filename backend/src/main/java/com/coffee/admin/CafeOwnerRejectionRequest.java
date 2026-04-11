package com.coffee.admin;

import jakarta.validation.constraints.Size;

public class CafeOwnerRejectionRequest {
	@Size(max = 300, message = "{cafe.owner.rejectionReason.size}")
	private String reason;

	public String getReason() {
		return reason;
	}

	public void setReason(String reason) {
		this.reason = reason;
	}
}
