package com.coffee.user;

public class UserResponse {
	private Long id;
	private String email;
	private Role role;
	private boolean active;
	private boolean emailVerified;
	private boolean mustResetPassword;

	public UserResponse(Long id, String email, Role role, boolean active, boolean emailVerified,
			boolean mustResetPassword) {
		this.id = id;
		this.email = email;
		this.role = role;
		this.active = active;
		this.emailVerified = emailVerified;
		this.mustResetPassword = mustResetPassword;
	}

	public Long getId() {
		return id;
	}

	public String getEmail() {
		return email;
	}

	public Role getRole() {
		return role;
	}

	public boolean isActive() {
		return active;
	}

	public boolean isEmailVerified() {
		return emailVerified;
	}

	public boolean isMustResetPassword() {
		return mustResetPassword;
	}
}
