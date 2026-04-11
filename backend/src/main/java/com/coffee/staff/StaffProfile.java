package com.coffee.staff;

import com.coffee.cafeowner.CafeOwnerProfile;
import com.coffee.user.User;
import jakarta.persistence.Column;
import jakarta.persistence.Entity;
import jakarta.persistence.EnumType;
import jakarta.persistence.Enumerated;
import jakarta.persistence.GeneratedValue;
import jakarta.persistence.GenerationType;
import jakarta.persistence.Id;
import jakarta.persistence.JoinColumn;
import jakarta.persistence.ManyToOne;
import jakarta.persistence.OneToOne;
import jakarta.persistence.PrePersist;
import jakarta.persistence.PreUpdate;
import jakarta.persistence.Table;
import java.time.Instant;

@Entity
@Table(name = "staff_profiles")
public class StaffProfile {
	@Id
	@GeneratedValue(strategy = GenerationType.IDENTITY)
	private Long id;

	@ManyToOne(optional = false)
	@JoinColumn(name = "cafe_owner_id", nullable = false)
	private CafeOwnerProfile cafeOwner;

	@OneToOne(optional = false)
	@JoinColumn(name = "user_id", nullable = false, unique = true)
	private User user;

	@Column(nullable = false, length = 120)
	private String fullName;

	@Column(nullable = false, length = 20)
	private String phoneNumber;

	@Column(length = 255)
	private String email;

	@Column(length = 20)
	private String gender;

	@Column(length = 300)
	private String profilePhotoUrl;

	@Enumerated(EnumType.STRING)
	@Column(nullable = false, length = 20)
	private StaffStatus status;

	@Enumerated(EnumType.STRING)
	@Column(nullable = false, length = 20)
	private StaffShift shift;

	@Column(length = 80)
	private String experience;

	@Column(length = 120)
	private String specialization;

	@Column(length = 120)
	private String sectionArea;

	@Column(nullable = false, updatable = false)
	private Instant createdAt;

	@Column(nullable = false)
	private Instant updatedAt;

	@PrePersist
	void onCreate() {
		Instant now = Instant.now();
		this.createdAt = now;
		this.updatedAt = now;
	}

	@PreUpdate
	void onUpdate() {
		this.updatedAt = Instant.now();
	}

	public Long getId() {
		return id;
	}

	public CafeOwnerProfile getCafeOwner() {
		return cafeOwner;
	}

	public void setCafeOwner(CafeOwnerProfile cafeOwner) {
		this.cafeOwner = cafeOwner;
	}

	public User getUser() {
		return user;
	}

	public void setUser(User user) {
		this.user = user;
	}

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

	public StaffStatus getStatus() {
		return status;
	}

	public void setStatus(StaffStatus status) {
		this.status = status;
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

	public String getSectionArea() {
		return sectionArea;
	}

	public void setSectionArea(String sectionArea) {
		this.sectionArea = sectionArea;
	}
}
