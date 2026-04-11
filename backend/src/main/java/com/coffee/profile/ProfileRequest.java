package com.coffee.profile;

import jakarta.validation.Valid;
import jakarta.validation.constraints.Size;
import java.time.LocalDate;
import java.util.List;

public class ProfileRequest {
	@Size(max = 100)
	private String firstName;

	@Size(max = 100)
	private String lastName;

	private LocalDate dob;

	@Size(max = 20)
	private String gender;

	@Size(max = 20)
	private String contactNo;

	@Size(max = 30)
	private String maritalStatus;

	@Size(max = 255)
	private String street;

	@Size(max = 50)
	private String plotNo;

	@Size(max = 100)
	private String city;

	@Size(max = 100)
	private String state;

	@Size(max = 20)
	private String pincode;

	@Size(max = 60)
	private String country;

	@Valid
	private List<AcademicInfoRequest> academics;

	@Valid
	private List<WorkExperienceRequest> workExperiences;

	public String getFirstName() {
		return firstName;
	}

	public void setFirstName(String firstName) {
		this.firstName = firstName;
	}

	public String getLastName() {
		return lastName;
	}

	public void setLastName(String lastName) {
		this.lastName = lastName;
	}

	public LocalDate getDob() {
		return dob;
	}

	public void setDob(LocalDate dob) {
		this.dob = dob;
	}

	public String getGender() {
		return gender;
	}

	public void setGender(String gender) {
		this.gender = gender;
	}

	public String getContactNo() {
		return contactNo;
	}

	public void setContactNo(String contactNo) {
		this.contactNo = contactNo;
	}

	public String getMaritalStatus() {
		return maritalStatus;
	}

	public void setMaritalStatus(String maritalStatus) {
		this.maritalStatus = maritalStatus;
	}

	public String getStreet() {
		return street;
	}

	public void setStreet(String street) {
		this.street = street;
	}

	public String getPlotNo() {
		return plotNo;
	}

	public void setPlotNo(String plotNo) {
		this.plotNo = plotNo;
	}

	public String getCity() {
		return city;
	}

	public void setCity(String city) {
		this.city = city;
	}

	public String getState() {
		return state;
	}

	public void setState(String state) {
		this.state = state;
	}

	public String getPincode() {
		return pincode;
	}

	public void setPincode(String pincode) {
		this.pincode = pincode;
	}

	public String getCountry() {
		return country;
	}

	public void setCountry(String country) {
		this.country = country;
	}

	public List<AcademicInfoRequest> getAcademics() {
		return academics;
	}

	public void setAcademics(List<AcademicInfoRequest> academics) {
		this.academics = academics;
	}

	public List<WorkExperienceRequest> getWorkExperiences() {
		return workExperiences;
	}

	public void setWorkExperiences(List<WorkExperienceRequest> workExperiences) {
		this.workExperiences = workExperiences;
	}
}
