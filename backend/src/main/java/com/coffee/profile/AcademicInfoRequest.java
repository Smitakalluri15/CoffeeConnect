package com.coffee.profile;

import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.Size;

public class AcademicInfoRequest {
	@NotBlank
	@Size(max = 150)
	private String institution;

	@NotBlank
	@Size(max = 150)
	private String degree;

	@Size(max = 150)
	private String fieldOfStudy;

	private Integer startYear;

	private Integer endYear;

	public String getInstitution() {
		return institution;
	}

	public void setInstitution(String institution) {
		this.institution = institution;
	}

	public String getDegree() {
		return degree;
	}

	public void setDegree(String degree) {
		this.degree = degree;
	}

	public String getFieldOfStudy() {
		return fieldOfStudy;
	}

	public void setFieldOfStudy(String fieldOfStudy) {
		this.fieldOfStudy = fieldOfStudy;
	}

	public Integer getStartYear() {
		return startYear;
	}

	public void setStartYear(Integer startYear) {
		this.startYear = startYear;
	}

	public Integer getEndYear() {
		return endYear;
	}

	public void setEndYear(Integer endYear) {
		this.endYear = endYear;
	}
}
