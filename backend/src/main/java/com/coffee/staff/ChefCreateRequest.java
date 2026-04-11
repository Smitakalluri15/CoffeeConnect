package com.coffee.staff;

import jakarta.validation.constraints.Email;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;
import jakarta.validation.constraints.Pattern;
import jakarta.validation.constraints.Size;

public class ChefCreateRequest {
	@NotBlank(message = "{staff.fullName.required}")
	@Size(max = 120, message = "{staff.fullName.size}")
	private String fullName;

	@NotBlank(message = "{staff.phone.required}")
	@Pattern(regexp = "^[0-9]{10}$", message = "{staff.phone.invalid}")
	private String phoneNumber;

	@Email(message = "{staff.email.invalid}")
	@Size(max = 255, message = "{staff.email.size}")
	private String email;

	@Size(max = 20, message = "{staff.gender.size}")
	private String gender;

	@Size(max = 300, message = "{staff.photo.size}")
	private String profilePhotoUrl;

	@NotBlank(message = "{staff.login.required}")
	@Size(max = 255, message = "{staff.login.size}")
	private String loginId;

	@NotBlank(message = "{staff.password.required}")
	@Size(min = 8, max = 64, message = "{staff.password.size}")
	private String password;

	@NotNull(message = "{staff.shift.required}")
	private StaffShift shift;

	@Size(max = 80, message = "{staff.experience.size}")
	private String experience;

	@Size(max = 120, message = "{staff.specialization.size}")
	private String specialization;

	public String getFullName() {
		return fullName;
	}

	public void setFullName(String fullName) {
		this.fullName = fullName;
	}

	public String getPhoneNumber() {
		return phoneNumber;
	}

	public void setPhoneNumber(String phoneNumber) {
		this.phoneNumber = phoneNumber;
	}

	public String getEmail() {
		return email;
	}

	public void setEmail(String email) {
		this.email = email;
	}

	public String getGender() {
		return gender;
	}

	public void setGender(String gender) {
		this.gender = gender;
	}

	public String getProfilePhotoUrl() {
		return profilePhotoUrl;
	}

	public void setProfilePhotoUrl(String profilePhotoUrl) {
		this.profilePhotoUrl = profilePhotoUrl;
	}

	public String getLoginId() {
		return loginId;
	}

	public void setLoginId(String loginId) {
		this.loginId = loginId;
	}

	public String getPassword() {
		return password;
	}

	public void setPassword(String password) {
		this.password = password;
	}

	public StaffShift getShift() {
		return shift;
	}

	public void setShift(StaffShift shift) {
		this.shift = shift;
	}

	public String getExperience() {
		return experience;
	}

	public void setExperience(String experience) {
		this.experience = experience;
	}

	public String getSpecialization() {
		return specialization;
	}

	public void setSpecialization(String specialization) {
		this.specialization = specialization;
	}
}
