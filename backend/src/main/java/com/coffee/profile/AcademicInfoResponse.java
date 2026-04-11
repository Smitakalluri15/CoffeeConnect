package com.coffee.profile;

public class AcademicInfoResponse {
	private Long id;
	private String institution;
	private String degree;
	private String fieldOfStudy;
	private Integer startYear;
	private Integer endYear;

	public AcademicInfoResponse(Long id, String institution, String degree, String fieldOfStudy, Integer startYear,
			Integer endYear) {
		this.id = id;
		this.institution = institution;
		this.degree = degree;
		this.fieldOfStudy = fieldOfStudy;
		this.startYear = startYear;
		this.endYear = endYear;
	}

	public Long getId() {
		return id;
	}

	public String getInstitution() {
		return institution;
	}

	public String getDegree() {
		return degree;
	}

	public String getFieldOfStudy() {
		return fieldOfStudy;
	}

	public Integer getStartYear() {
		return startYear;
	}

	public Integer getEndYear() {
		return endYear;
	}
}
