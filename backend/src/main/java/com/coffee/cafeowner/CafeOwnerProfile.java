package com.coffee.cafeowner;

import jakarta.persistence.Column;
import jakarta.persistence.Entity;
import jakarta.persistence.EnumType;
import jakarta.persistence.Enumerated;
import jakarta.persistence.GeneratedValue;
import jakarta.persistence.GenerationType;
import jakarta.persistence.Id;
import jakarta.persistence.CascadeType;
import jakarta.persistence.OneToMany;
import jakarta.persistence.PrePersist;
import jakarta.persistence.Table;
import com.coffee.menu.MenuCategory;
import java.math.BigDecimal;
import java.time.Instant;
import java.time.LocalDate;
import java.time.LocalTime;
import java.util.ArrayList;
import java.util.List;

@Entity
@Table(name = "cafe_owner_profiles")
public class CafeOwnerProfile {
	@Id
	@GeneratedValue(strategy = GenerationType.IDENTITY)
	private Long id;

	@Column(nullable = false, length = 150)
	private String cafeName;

	@Column(length = 120)
	private String brandName;

	@Column(length = 500)
	private String description;

	@Enumerated(EnumType.STRING)
	@Column(length = 30)
	private CafeType cafeType;

	private LocalDate openingDate;

	@Column(nullable = false, length = 120)
	private String ownerName;

	@Column(nullable = false, length = 20)
	private String contactNumber;

	@Column(nullable = false, unique = true, length = 255)
	private String email;

	@Column(nullable = false, length = 255)
	private String passwordHash;

	@Column(nullable = false)
	private LocalTime openingTime;

	@Column(nullable = false)
	private LocalTime closingTime;

	@Column(length = 80)
	private String workingDays;

	@Column(nullable = false, length = 200)
	private String street;

	@Column(length = 160)
	private String landmark;

	@Column(nullable = false, length = 100)
	private String city;

	@Column(nullable = false, length = 100)
	private String state;

	@Column(nullable = false, length = 10)
	private String pincode;

	private Double latitude;

	private Double longitude;

	@Column(length = 20)
	private String cafeContactNumber;

	@Column(length = 255)
	private String cafeEmail;

	@Column(length = 20)
	private String whatsappNumber;

	@Column(nullable = false, length = 50)
	private String fssaiLicenseNumber;

	@Column(length = 20)
	private String gstNumber;

	@Column(length = 300)
	private String shopPhotoUrl;

	@Column(length = 300)
	private String licenseDocumentUrl;

	@Column(length = 300)
	private String ownerIdProofUrl;

	@Column(length = 300)
	private String cafeLogoUrl;

	@Column(length = 300)
	private String coverImageUrl;

	@Column(length = 1000)
	private String galleryImages;

	@Column(length = 120)
	private String accountHolderName;

	@Column(length = 30)
	private String accountNumber;

	@Column(length = 20)
	private String ifscCode;

	@Column(length = 100)
	private String upiId;

	@Column
	private boolean acceptCash;

	@Column(nullable = false)
	private boolean hasHomeDelivery;

	@Column(nullable = false)
	private boolean hasTakeaway;

	@Column(nullable = false)
	private boolean hasDineIn;

	@Column
	private boolean cafeVisible;

	@Column
	private boolean ordersPaused;

	private BigDecimal minOrderValue;

	private Integer prepTimeMinutes;

	@Column(nullable = false, updatable = false)
	private Instant registrationDate;

	@Enumerated(EnumType.STRING)
	@Column(nullable = false, length = 30)
	private CafeOwnerStatus status;

	@Enumerated(EnumType.STRING)
	@Column(nullable = false, length = 30)
	private VerificationStatus verificationStatus;

	@Column(length = 300)
	private String rejectionReason;

	@OneToMany(mappedBy = "cafeOwner", cascade = CascadeType.ALL, orphanRemoval = true)
	private List<MenuCategory> menuCategories = new ArrayList<>();

	@PrePersist
	void onCreate() {
		if (registrationDate == null) {
			registrationDate = Instant.now();
		}
	}

	public Long getId() {
		return id;
	}

	public String getCafeName() {
		return cafeName;
	}

	public void setCafeName(String cafeName) {
		this.cafeName = cafeName;
	}

	public String getBrandName() {
		return brandName;
	}

	public void setBrandName(String brandName) {
		this.brandName = brandName;
	}

	public String getDescription() {
		return description;
	}

	public void setDescription(String description) {
		this.description = description;
	}

	public CafeType getCafeType() {
		return cafeType;
	}

	public void setCafeType(CafeType cafeType) {
		this.cafeType = cafeType;
	}

	public LocalDate getOpeningDate() {
		return openingDate;
	}

	public void setOpeningDate(LocalDate openingDate) {
		this.openingDate = openingDate;
	}

	public String getOwnerName() {
		return ownerName;
	}

	public void setOwnerName(String ownerName) {
		this.ownerName = ownerName;
	}

	public String getContactNumber() {
		return contactNumber;
	}

	public void setContactNumber(String contactNumber) {
		this.contactNumber = contactNumber;
	}

	public String getEmail() {
		return email;
	}

	public void setEmail(String email) {
		this.email = email;
	}

	public String getPasswordHash() {
		return passwordHash;
	}

	public void setPasswordHash(String passwordHash) {
		this.passwordHash = passwordHash;
	}

	public LocalTime getOpeningTime() {
		return openingTime;
	}

	public void setOpeningTime(LocalTime openingTime) {
		this.openingTime = openingTime;
	}

	public LocalTime getClosingTime() {
		return closingTime;
	}

	public void setClosingTime(LocalTime closingTime) {
		this.closingTime = closingTime;
	}

	public String getWorkingDays() {
		return workingDays;
	}

	public void setWorkingDays(String workingDays) {
		this.workingDays = workingDays;
	}

	public String getStreet() {
		return street;
	}

	public void setStreet(String street) {
		this.street = street;
	}

	public String getLandmark() {
		return landmark;
	}

	public void setLandmark(String landmark) {
		this.landmark = landmark;
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

	public Double getLatitude() {
		return latitude;
	}

	public void setLatitude(Double latitude) {
		this.latitude = latitude;
	}

	public Double getLongitude() {
		return longitude;
	}

	public void setLongitude(Double longitude) {
		this.longitude = longitude;
	}

	public String getCafeContactNumber() {
		return cafeContactNumber;
	}

	public void setCafeContactNumber(String cafeContactNumber) {
		this.cafeContactNumber = cafeContactNumber;
	}

	public String getCafeEmail() {
		return cafeEmail;
	}

	public void setCafeEmail(String cafeEmail) {
		this.cafeEmail = cafeEmail;
	}

	public String getWhatsappNumber() {
		return whatsappNumber;
	}

	public void setWhatsappNumber(String whatsappNumber) {
		this.whatsappNumber = whatsappNumber;
	}

	public String getFssaiLicenseNumber() {
		return fssaiLicenseNumber;
	}

	public void setFssaiLicenseNumber(String fssaiLicenseNumber) {
		this.fssaiLicenseNumber = fssaiLicenseNumber;
	}

	public String getGstNumber() {
		return gstNumber;
	}

	public void setGstNumber(String gstNumber) {
		this.gstNumber = gstNumber;
	}

	public String getShopPhotoUrl() {
		return shopPhotoUrl;
	}

	public void setShopPhotoUrl(String shopPhotoUrl) {
		this.shopPhotoUrl = shopPhotoUrl;
	}

	public String getLicenseDocumentUrl() {
		return licenseDocumentUrl;
	}

	public void setLicenseDocumentUrl(String licenseDocumentUrl) {
		this.licenseDocumentUrl = licenseDocumentUrl;
	}

	public String getOwnerIdProofUrl() {
		return ownerIdProofUrl;
	}

	public void setOwnerIdProofUrl(String ownerIdProofUrl) {
		this.ownerIdProofUrl = ownerIdProofUrl;
	}

	public String getCafeLogoUrl() {
		return cafeLogoUrl;
	}

	public void setCafeLogoUrl(String cafeLogoUrl) {
		this.cafeLogoUrl = cafeLogoUrl;
	}

	public String getCoverImageUrl() {
		return coverImageUrl;
	}

	public void setCoverImageUrl(String coverImageUrl) {
		this.coverImageUrl = coverImageUrl;
	}

	public String getGalleryImages() {
		return galleryImages;
	}

	public void setGalleryImages(String galleryImages) {
		this.galleryImages = galleryImages;
	}

	public String getAccountHolderName() {
		return accountHolderName;
	}

	public void setAccountHolderName(String accountHolderName) {
		this.accountHolderName = accountHolderName;
	}

	public String getAccountNumber() {
		return accountNumber;
	}

	public void setAccountNumber(String accountNumber) {
		this.accountNumber = accountNumber;
	}

	public String getIfscCode() {
		return ifscCode;
	}

	public void setIfscCode(String ifscCode) {
		this.ifscCode = ifscCode;
	}

	public String getUpiId() {
		return upiId;
	}

	public void setUpiId(String upiId) {
		this.upiId = upiId;
	}

	public boolean isAcceptCash() {
		return acceptCash;
	}

	public void setAcceptCash(boolean acceptCash) {
		this.acceptCash = acceptCash;
	}

	public boolean isHasHomeDelivery() {
		return hasHomeDelivery;
	}

	public void setHasHomeDelivery(boolean hasHomeDelivery) {
		this.hasHomeDelivery = hasHomeDelivery;
	}

	public boolean isHasTakeaway() {
		return hasTakeaway;
	}

	public void setHasTakeaway(boolean hasTakeaway) {
		this.hasTakeaway = hasTakeaway;
	}

	public boolean isHasDineIn() {
		return hasDineIn;
	}

	public void setHasDineIn(boolean hasDineIn) {
		this.hasDineIn = hasDineIn;
	}

	public boolean isCafeVisible() {
		return cafeVisible;
	}

	public void setCafeVisible(boolean cafeVisible) {
		this.cafeVisible = cafeVisible;
	}

	public boolean isOrdersPaused() {
		return ordersPaused;
	}

	public void setOrdersPaused(boolean ordersPaused) {
		this.ordersPaused = ordersPaused;
	}

	public BigDecimal getMinOrderValue() {
		return minOrderValue;
	}

	public void setMinOrderValue(BigDecimal minOrderValue) {
		this.minOrderValue = minOrderValue;
	}

	public Integer getPrepTimeMinutes() {
		return prepTimeMinutes;
	}

	public void setPrepTimeMinutes(Integer prepTimeMinutes) {
		this.prepTimeMinutes = prepTimeMinutes;
	}

	public Instant getRegistrationDate() {
		return registrationDate;
	}

	public CafeOwnerStatus getStatus() {
		return status;
	}

	public void setStatus(CafeOwnerStatus status) {
		this.status = status;
	}

	public VerificationStatus getVerificationStatus() {
		return verificationStatus;
	}

	public void setVerificationStatus(VerificationStatus verificationStatus) {
		this.verificationStatus = verificationStatus;
	}

	public String getRejectionReason() {
		return rejectionReason;
	}

	public void setRejectionReason(String rejectionReason) {
		this.rejectionReason = rejectionReason;
	}

	public List<MenuCategory> getMenuCategories() {
		return menuCategories;
	}

	public void setMenuCategories(List<MenuCategory> menuCategories) {
		this.menuCategories = menuCategories;
	}
}
