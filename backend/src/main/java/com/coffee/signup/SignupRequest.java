package com.coffee.signup;

import com.coffee.auth.RegisterRequest;
import com.coffee.cafeowner.CafeOwnerRegistrationRequest;
import jakarta.validation.Valid;
import jakarta.validation.constraints.AssertTrue;
import jakarta.validation.constraints.NotNull;

public class SignupRequest {
	@NotNull(message = "{signup.role.required}")
	private SignupRole role;

	@Valid
	private RegisterRequest user;

	@Valid
	private CafeOwnerRegistrationRequest cafeOwner;

	public SignupRole getRole() {
		return role;
	}

	public void setRole(SignupRole role) {
		this.role = role;
	}

	public RegisterRequest getUser() {
		return user;
	}

	public void setUser(RegisterRequest user) {
		this.user = user;
	}

	public CafeOwnerRegistrationRequest getCafeOwner() {
		return cafeOwner;
	}

	public void setCafeOwner(CafeOwnerRegistrationRequest cafeOwner) {
		this.cafeOwner = cafeOwner;
	}

	@AssertTrue(message = "{signup.user.required}")
	public boolean isUserPayloadValid() {
		return role != SignupRole.USER || user != null;
	}

	@AssertTrue(message = "{signup.owner.required}")
	public boolean isOwnerPayloadValid() {
		return role != SignupRole.CAFE_OWNER || cafeOwner != null;
	}
}
