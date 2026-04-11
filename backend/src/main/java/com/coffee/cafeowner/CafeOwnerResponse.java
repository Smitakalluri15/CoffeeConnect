package com.coffee.cafeowner;

import java.math.BigDecimal;
import java.time.Instant;
import java.time.LocalDate;
import java.time.LocalTime;
import java.util.List;

public class CafeOwnerResponse {
	private final Long id;
	private final String cafeName;
	private final String brandName;
	private final String description;
	private final CafeType cafeType;
	private final LocalDate openingDate;
	private final String ownerName;
	private final String contactNumber;
	private final String email;
	private final String cafeContactNumber;
	private final String cafeEmail;
	private final String whatsappNumber;
	private final LocalTime openingTime;
	private final LocalTime closingTime;
	private final List<String> workingDays;
	private final boolean openNow;
	private final String street;
	private final String landmark;
	private final String city;
	private final String state;
	private final String pincode;
	private final Double latitude;
	private final Double longitude;
	private final String fssaiLicenseNumber;
	private final String gstNumber;
	private final String shopPhotoUrl;
	private final String licenseDocumentUrl;
	private final String ownerIdProofUrl;
	private final String cafeLogoUrl;
	private final String coverImageUrl;
	private final List<String> galleryImages;
	private final String accountHolderName;
	private final String accountNumber;
	private final String ifscCode;
	private final String upiId;
	private final boolean acceptCash;
	private final boolean hasHomeDelivery;
	private final boolean hasTakeaway;
	private final boolean hasDineIn;
	private final boolean cafeVisible;
	private final boolean ordersPaused;
	private final BigDecimal minOrderValue;
	private final Integer prepTimeMinutes;
	private final Instant registrationDate;
	private final CafeOwnerStatus status;
	private final VerificationStatus verificationStatus;
	private final String rejectionReason;

	public CafeOwnerResponse(Long id, String cafeName, String brandName, String description, CafeType cafeType,
			LocalDate openingDate, String ownerName, String contactNumber, String email, String cafeContactNumber,
			String cafeEmail, String whatsappNumber, LocalTime openingTime, LocalTime closingTime,
			List<String> workingDays, boolean openNow, String street, String landmark, String city, String state,
			String pincode, Double latitude, Double longitude, String fssaiLicenseNumber, String gstNumber,
			String shopPhotoUrl, String licenseDocumentUrl, String ownerIdProofUrl, String cafeLogoUrl,
			String coverImageUrl, List<String> galleryImages, String accountHolderName, String accountNumber,
			String ifscCode, String upiId, boolean acceptCash, boolean hasHomeDelivery, boolean hasTakeaway,
			boolean hasDineIn, boolean cafeVisible, boolean ordersPaused, BigDecimal minOrderValue,
			Integer prepTimeMinutes, Instant registrationDate, CafeOwnerStatus status,
			VerificationStatus verificationStatus, String rejectionReason) {
		this.id = id;
		this.cafeName = cafeName;
		this.brandName = brandName;
		this.description = description;
		this.cafeType = cafeType;
		this.openingDate = openingDate;
		this.ownerName = ownerName;
		this.contactNumber = contactNumber;
		this.email = email;
		this.cafeContactNumber = cafeContactNumber;
		this.cafeEmail = cafeEmail;
		this.whatsappNumber = whatsappNumber;
		this.openingTime = openingTime;
		this.closingTime = closingTime;
		this.workingDays = workingDays;
		this.openNow = openNow;
		this.street = street;
		this.landmark = landmark;
		this.city = city;
		this.state = state;
		this.pincode = pincode;
		this.latitude = latitude;
		this.longitude = longitude;
		this.fssaiLicenseNumber = fssaiLicenseNumber;
		this.gstNumber = gstNumber;
		this.shopPhotoUrl = shopPhotoUrl;
		this.licenseDocumentUrl = licenseDocumentUrl;
		this.ownerIdProofUrl = ownerIdProofUrl;
		this.cafeLogoUrl = cafeLogoUrl;
		this.coverImageUrl = coverImageUrl;
		this.galleryImages = galleryImages;
		this.accountHolderName = accountHolderName;
		this.accountNumber = accountNumber;
		this.ifscCode = ifscCode;
		this.upiId = upiId;
		this.acceptCash = acceptCash;
		this.hasHomeDelivery = hasHomeDelivery;
		this.hasTakeaway = hasTakeaway;
		this.hasDineIn = hasDineIn;
		this.cafeVisible = cafeVisible;
		this.ordersPaused = ordersPaused;
		this.minOrderValue = minOrderValue;
		this.prepTimeMinutes = prepTimeMinutes;
		this.registrationDate = registrationDate;
		this.status = status;
		this.verificationStatus = verificationStatus;
		this.rejectionReason = rejectionReason;
	}

	public Long getId() {
		return id;
	}

	public String getCafeName() {
		return cafeName;
	}

	public String getBrandName() {
		return brandName;
	}

	public String getDescription() {
		return description;
	}

	public CafeType getCafeType() {
		return cafeType;
	}

	public LocalDate getOpeningDate() {
		return openingDate;
	}

	public String getOwnerName() {
		return ownerName;
	}

	public String getContactNumber() {
		return contactNumber;
	}

	public String getEmail() {
		return email;
	}

	public String getCafeContactNumber() {
		return cafeContactNumber;
	}

	public String getCafeEmail() {
		return cafeEmail;
	}

	public String getWhatsappNumber() {
		return whatsappNumber;
	}

	public LocalTime getOpeningTime() {
		return openingTime;
	}

	public LocalTime getClosingTime() {
		return closingTime;
	}

	public List<String> getWorkingDays() {
		return workingDays;
	}

	public boolean isOpenNow() {
		return openNow;
	}

	public String getStreet() {
		return street;
	}

	public String getLandmark() {
		return landmark;
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

	public Double getLatitude() {
		return latitude;
	}

	public Double getLongitude() {
		return longitude;
	}

	public String getFssaiLicenseNumber() {
		return fssaiLicenseNumber;
	}

	public String getGstNumber() {
		return gstNumber;
	}

	public String getShopPhotoUrl() {
		return shopPhotoUrl;
	}

	public String getLicenseDocumentUrl() {
		return licenseDocumentUrl;
	}

	public String getOwnerIdProofUrl() {
		return ownerIdProofUrl;
	}

	public String getCafeLogoUrl() {
		return cafeLogoUrl;
	}

	public String getCoverImageUrl() {
		return coverImageUrl;
	}

	public List<String> getGalleryImages() {
		return galleryImages;
	}

	public String getAccountHolderName() {
		return accountHolderName;
	}

	public String getAccountNumber() {
		return accountNumber;
	}

	public String getIfscCode() {
		return ifscCode;
	}

	public String getUpiId() {
		return upiId;
	}

	public boolean isAcceptCash() {
		return acceptCash;
	}

	public boolean isHasHomeDelivery() {
		return hasHomeDelivery;
	}

	public boolean isHasTakeaway() {
		return hasTakeaway;
	}

	public boolean isHasDineIn() {
		return hasDineIn;
	}

	public boolean isCafeVisible() {
		return cafeVisible;
	}

	public boolean isOrdersPaused() {
		return ordersPaused;
	}

	public BigDecimal getMinOrderValue() {
		return minOrderValue;
	}

	public Integer getPrepTimeMinutes() {
		return prepTimeMinutes;
	}

	public Instant getRegistrationDate() {
		return registrationDate;
	}

	public CafeOwnerStatus getStatus() {
		return status;
	}

	public VerificationStatus getVerificationStatus() {
		return verificationStatus;
	}

	public String getRejectionReason() {
		return rejectionReason;
	}
}
