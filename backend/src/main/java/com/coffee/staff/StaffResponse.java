package com.coffee.staff;

import com.coffee.user.Role;

public class StaffResponse {
	private final Long id;
	private final Long assignedCafeId;
	private final String fullName;
	private final String phoneNumber;
	private final String email;
	private final String gender;
	private final String profilePhotoUrl;
	private final String loginId;
	private final Role role;
	private final StaffStatus status;
	private final StaffShift shift;
	private final String experience;
	private final String specialization;
	private final String sectionArea;

	public StaffResponse(Long id, Long assignedCafeId, String fullName, String phoneNumber, String email, String gender,
			String profilePhotoUrl, String loginId, Role role, StaffStatus status, StaffShift shift, String experience,
			String specialization, String sectionArea) {
		this.id = id;
		this.assignedCafeId = assignedCafeId;
		this.fullName = fullName;
		this.phoneNumber = phoneNumber;
		this.email = email;
		this.gender = gender;
		this.profilePhotoUrl = profilePhotoUrl;
		this.loginId = loginId;
		this.role = role;
		this.status = status;
		this.shift = shift;
		this.experience = experience;
		this.specialization = specialization;
		this.sectionArea = sectionArea;
	}

	public Long getId() {
		return id;
	}

	public Long getAssignedCafeId() {
		return assignedCafeId;
	}

	public String getFullName() {
		return fullName;
	}

	public String getPhoneNumber() {
		return phoneNumber;
	}

	public String getEmail() {
		return email;
	}

	public String getGender() {
		return gender;
	}

	public String getProfilePhotoUrl() {
		return profilePhotoUrl;
	}

	public String getLoginId() {
		return loginId;
	}

	public Role getRole() {
		return role;
	}

	public StaffStatus getStatus() {
		return status;
	}

	public StaffShift getShift() {
		return shift;
	}

	public String getExperience() {
		return experience;
	}

	public String getSpecialization() {
		return specialization;
	}

	public String getSectionArea() {
		return sectionArea;
	}
}
