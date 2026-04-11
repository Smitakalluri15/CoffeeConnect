package com.coffee.cafeowner;

import com.fasterxml.jackson.annotation.JsonFormat;
import jakarta.validation.constraints.DecimalMax;
import jakarta.validation.constraints.DecimalMin;
import jakarta.validation.constraints.Email;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;
import jakarta.validation.constraints.Pattern;
import jakarta.validation.constraints.Size;
import java.time.LocalDate;
import java.util.List;

public class CafeOwnerUpdateRequest {
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

	@NotBlank(message = "{cafe.owner.cafeContactNumber.required}")
	@Pattern(regexp = "^[0-9]{10}$", message = "{cafe.owner.cafeContactNumber.invalid}")
	private String cafeContactNumber;

	@NotBlank(message = "{cafe.owner.cafeEmail.required}")
	@Email(message = "{cafe.owner.cafeEmail.invalid}")
	private String cafeEmail;

	@Pattern(regexp = "^$|[0-9]{10}$", message = "{cafe.owner.whatsapp.invalid}")
	private String whatsappNumber;

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

	@Size(max = 300, message = "{cafe.owner.cafeLogo.size}")
	private String cafeLogoUrl;

	@Size(max = 300, message = "{cafe.owner.coverImage.size}")
	private String coverImageUrl;

	@Size(max = 1000, message = "{cafe.owner.galleryImages.size}")
	private String galleryImages;

	@NotNull(message = "{cafe.owner.workingDays.required}")
	private List<String> workingDays;

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

	public List<String> getWorkingDays() {
		return workingDays;
	}

	public void setWorkingDays(List<String> workingDays) {
		this.workingDays = workingDays;
	}
}
