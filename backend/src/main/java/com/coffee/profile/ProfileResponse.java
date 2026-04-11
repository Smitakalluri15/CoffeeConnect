package com.coffee.profile;

import java.time.LocalDate;
import java.util.List;

public class ProfileResponse {
	private Long id;
	private String firstName;
	private String lastName;
	private LocalDate dob;
	private String gender;
	private String contactNo;
	private String maritalStatus;
	private String street;
	private String plotNo;
	private String city;
	private String state;
	private String pincode;
	private String country;
	private int completionPercent;
	private List<AcademicInfoResponse> academics;
	private List<WorkExperienceResponse> workExperiences;

	public ProfileResponse(Long id, String firstName, String lastName, LocalDate dob, String gender, String contactNo,
			String maritalStatus, String street, String plotNo, String city, String state, String pincode,
			String country, int completionPercent, List<AcademicInfoResponse> academics,
			List<WorkExperienceResponse> workExperiences) {
		this.id = id;
		this.firstName = firstName;
		this.lastName = lastName;
		this.dob = dob;
		this.gender = gender;
		this.contactNo = contactNo;
		this.maritalStatus = maritalStatus;
		this.street = street;
		this.plotNo = plotNo;
		this.city = city;
		this.state = state;
		this.pincode = pincode;
		this.country = country;
		this.completionPercent = completionPercent;
		this.academics = academics;
		this.workExperiences = workExperiences;
	}

	public Long getId() {
		return id;
	}

	public String getFirstName() {
		return firstName;
	}

	public String getLastName() {
		return lastName;
	}

	public LocalDate getDob() {
		return dob;
	}

	public String getGender() {
		return gender;
	}

	public String getContactNo() {
		return contactNo;
	}

	public String getMaritalStatus() {
		return maritalStatus;
	}

	public String getStreet() {
		return street;
	}

	public String getPlotNo() {
		return plotNo;
	}

	public String getCity() {
		return city;
	}

	public String getState() {
		return state;
	}

	public String getPincode() {
		return pincode;
	}

	public String getCountry() {
		return country;
	}

	public int getCompletionPercent() {
		return completionPercent;
	}

	public List<AcademicInfoResponse> getAcademics() {
		return academics;
	}

	public List<WorkExperienceResponse> getWorkExperiences() {
		return workExperiences;
	}
}
