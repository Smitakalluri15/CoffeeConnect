package com.coffee.profile;

import java.time.LocalDate;

public class WorkExperienceResponse {
	private Long id;
	private String company;
	private String title;
	private LocalDate startDate;
	private LocalDate endDate;
	private String description;

	public WorkExperienceResponse(Long id, String company, String title, LocalDate startDate, LocalDate endDate,
			String description) {
		this.id = id;
		this.company = company;
		this.title = title;
		this.startDate = startDate;
		this.endDate = endDate;
		this.description = description;
	}

	public Long getId() {
		return id;
	}

	public String getCompany() {
		return company;
	}

	public String getTitle() {
		return title;
	}

	public LocalDate getStartDate() {
		return startDate;
	}

	public LocalDate getEndDate() {
		return endDate;
	}

	public String getDescription() {
		return description;
	}
}
