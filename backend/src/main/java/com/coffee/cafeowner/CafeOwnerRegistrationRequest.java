package com.coffee.cafeowner;

import com.fasterxml.jackson.annotation.JsonFormat;
import com.coffee.menu.MenuCategoryRequest;
import jakarta.validation.Valid;
import jakarta.validation.constraints.DecimalMax;
import jakarta.validation.constraints.DecimalMin;
import jakarta.validation.constraints.Email;
import jakarta.validation.constraints.Min;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotEmpty;
import jakarta.validation.constraints.NotNull;
import jakarta.validation.constraints.Pattern;
import jakarta.validation.constraints.Size;
import java.math.BigDecimal;
import java.time.LocalDate;
import java.time.LocalTime;
import java.util.List;

public class CafeOwnerRegistrationRequest {
	@NotBlank(message = "{cafe.owner.cafeName.required}")
	@Size(max = 150, message = "{cafe.owner.cafeName.size}")
	private String cafeName;

	@Size(max = 120, message = "{cafe.owner.brandName.size}")
	private String brandName;

	@Size(max = 500, message = "{cafe.owner.description.size}")
	private String description;

	@NotNull(message = "{cafe.owner.cafeType.required}")
	private CafeType cafeType;

	@JsonFormat(pattern = "yyyy-MM-dd")
	private LocalDate openingDate;

	@NotBlank(message = "{cafe.owner.ownerName.required}")
	@Size(max = 120, message = "{cafe.owner.ownerName.size}")
	private String ownerName;

	@NotBlank(message = "{cafe.owner.contactNumber.required}")
	@Pattern(regexp = "^[0-9]{10}$", message = "{cafe.owner.contactNumber.invalid}")
	private String contactNumber;

	@NotBlank(message = "{cafe.owner.email.required}")
	@Email(message = "{cafe.owner.email.invalid}")
	private String email;

	@NotBlank(message = "{cafe.owner.password.required}")
	@Size(min = 8, max = 64, message = "{cafe.owner.password.size}")
	private String password;

	@NotBlank(message = "{cafe.owner.cafeContactNumber.required}")
	@Pattern(regexp = "^[0-9]{10}$", message = "{cafe.owner.cafeContactNumber.invalid}")
	private String cafeContactNumber;

	@NotBlank(message = "{cafe.owner.cafeEmail.required}")
	@Email(message = "{cafe.owner.cafeEmail.invalid}")
	private String cafeEmail;

	@Pattern(regexp = "^$|[0-9]{10}$", message = "{cafe.owner.whatsapp.invalid}")
	private String whatsappNumber;

	@NotNull(message = "{cafe.owner.openingTime.required}")
	@JsonFormat(pattern = "HH:mm")
	private LocalTime openingTime;

	@NotNull(message = "{cafe.owner.closingTime.required}")
	@JsonFormat(pattern = "HH:mm")
	private LocalTime closingTime;

	@NotEmpty(message = "{cafe.owner.workingDays.required}")
	private List<String> workingDays;

	@NotBlank(message = "{cafe.owner.street.required}")
	@Size(max = 200, message = "{cafe.owner.street.size}")
	private String street;

	@Size(max = 160, message = "{cafe.owner.landmark.size}")
	private String landmark;

	@NotBlank(message = "{cafe.owner.city.required}")
	@Size(max = 100, message = "{cafe.owner.city.size}")
	private String city;

	@NotBlank(message = "{cafe.owner.state.required}")
	@Size(max = 100, message = "{cafe.owner.state.size}")
	private String state;

	@NotBlank(message = "{cafe.owner.pincode.required}")
	@Pattern(regexp = "^[0-9]{6}$", message = "{cafe.owner.pincode.invalid}")
	private String pincode;

	@DecimalMin(value = "-90.0", message = "{cafe.owner.latitude.invalid}")
	@DecimalMax(value = "90.0", message = "{cafe.owner.latitude.invalid}")
	private Double latitude;

	@DecimalMin(value = "-180.0", message = "{cafe.owner.longitude.invalid}")
	@DecimalMax(value = "180.0", message = "{cafe.owner.longitude.invalid}")
	private Double longitude;

	@NotBlank(message = "{cafe.owner.fssai.required}")
	@Size(max = 50, message = "{cafe.owner.fssai.size}")
	private String fssaiLicenseNumber;

	@Pattern(regexp = "^$|[0-9A-Z]{15}$", message = "{cafe.owner.gst.invalid}")
	private String gstNumber;

	@Size(max = 300, message = "{cafe.owner.shopPhoto.size}")
	private String shopPhotoUrl;

	@Size(max = 300, message = "{cafe.owner.licenseDoc.size}")
	@NotBlank(message = "{cafe.owner.licenseDoc.required}")
	private String licenseDocumentUrl;

	@Size(max = 300, message = "{cafe.owner.ownerIdProof.size}")
	private String ownerIdProofUrl;

	@Size(max = 300, message = "{cafe.owner.cafeLogo.size}")
	private String cafeLogoUrl;

	@Size(max = 300, message = "{cafe.owner.coverImage.size}")
	private String coverImageUrl;

	@Size(max = 1000, message = "{cafe.owner.galleryImages.size}")
	private String galleryImages;

	@Size(max = 120, message = "{cafe.owner.accountHolder.size}")
	private String accountHolderName;

	@Pattern(regexp = "^$|[0-9]{9,18}$", message = "{cafe.owner.accountNumber.invalid}")
	private String accountNumber;

	@Pattern(regexp = "^$|[A-Z]{4}0[A-Z0-9]{6}$", message = "{cafe.owner.ifsc.invalid}")
	private String ifscCode;

	@Pattern(regexp = "^$|[A-Za-z0-9._-]{2,256}@[A-Za-z]{2,64}$", message = "{cafe.owner.upi.invalid}")
	private String upiId;

	@NotNull(message = "{cafe.owner.acceptCash.required}")
	private Boolean acceptCash;

	@NotNull(message = "{cafe.owner.hasHomeDelivery.required}")
	private Boolean hasHomeDelivery;

	@NotNull(message = "{cafe.owner.hasTakeaway.required}")
	private Boolean hasTakeaway;

	@NotNull(message = "{cafe.owner.hasDineIn.required}")
	private Boolean hasDineIn;

	@NotNull(message = "{cafe.owner.cafeVisible.required}")
	private Boolean cafeVisible;

	@NotNull(message = "{cafe.owner.ordersPaused.required}")
	private Boolean ordersPaused;

	@DecimalMin(value = "0.0", message = "{cafe.owner.minOrderValue.invalid}")
	private BigDecimal minOrderValue;

	@Min(value = 0, message = "{cafe.owner.prepTime.invalid}")
	private Integer prepTimeMinutes;

	@Valid
	private List<MenuCategoryRequest> menuCategories;

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

	public String getPassword() {
		return password;
	}

	public void setPassword(String password) {
		this.password = password;
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

	public List<String> getWorkingDays() {
		return workingDays;
	}

	public void setWorkingDays(List<String> workingDays) {
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

	public Boolean getAcceptCash() {
		return acceptCash;
	}

	public void setAcceptCash(Boolean acceptCash) {
		this.acceptCash = acceptCash;
	}

	public Boolean getHasHomeDelivery() {
		return hasHomeDelivery;
	}

	public void setHasHomeDelivery(Boolean hasHomeDelivery) {
		this.hasHomeDelivery = hasHomeDelivery;
	}

	public Boolean getHasTakeaway() {
		return hasTakeaway;
	}

	public void setHasTakeaway(Boolean hasTakeaway) {
		this.hasTakeaway = hasTakeaway;
	}

	public Boolean getHasDineIn() {
		return hasDineIn;
	}

	public void setHasDineIn(Boolean hasDineIn) {
		this.hasDineIn = hasDineIn;
	}

	public Boolean getCafeVisible() {
		return cafeVisible;
	}

	public void setCafeVisible(Boolean cafeVisible) {
		this.cafeVisible = cafeVisible;
	}

	public Boolean getOrdersPaused() {
		return ordersPaused;
	}

	public void setOrdersPaused(Boolean ordersPaused) {
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

	public List<MenuCategoryRequest> getMenuCategories() {
		return menuCategories;
	}

	public void setMenuCategories(List<MenuCategoryRequest> menuCategories) {
		this.menuCategories = menuCategories;
	}
}
