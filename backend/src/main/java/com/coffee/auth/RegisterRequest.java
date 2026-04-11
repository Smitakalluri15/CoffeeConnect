package com.coffee.auth;

import com.coffee.profile.ProfileRequest;
import com.coffee.profile.GovtProofRequest;
import jakarta.validation.Valid;
import jakarta.validation.constraints.Email;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;
import jakarta.validation.constraints.Size;

public class RegisterRequest {
	@Email
	@NotBlank
	private String email;

	@NotBlank
	@Size(min = 8, max = 64)
	private String password;

	@NotNull
	@Valid
	private ProfileRequest profile;

	@NotNull
	@Valid
	private GovtProofRequest govtProof;

	public String getEmail() {
		return email;
	}

	public void setEmail(String email) {
		this.email = email;
	}

	public String getPassword() {
		return password;
	}

	public void setPassword(String password) {
		this.password = password;
	}

	public ProfileRequest getProfile() {
		return profile;
	}

	public void setProfile(ProfileRequest profile) {
		this.profile = profile;
	}

	public GovtProofRequest getGovtProof() {
		return govtProof;
	}

	public void setGovtProof(GovtProofRequest govtProof) {
		this.govtProof = govtProof;
	}
}
