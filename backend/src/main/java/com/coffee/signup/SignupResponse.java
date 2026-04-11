package com.coffee.signup;

public class SignupResponse {
	private final SignupRole role;
	private final String message;
	private final Long referenceId;

	public SignupResponse(SignupRole role, String message, Long referenceId) {
		this.role = role;
		this.message = message;
		this.referenceId = referenceId;
	}

	public SignupRole getRole() {
		return role;
	}

	public String getMessage() {
		return message;
	}

	public Long getReferenceId() {
		return referenceId;
	}
}
