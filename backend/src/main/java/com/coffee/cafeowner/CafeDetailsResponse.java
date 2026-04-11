package com.coffee.cafeowner;

import com.coffee.menu.MenuCategoryResponse;
import java.time.LocalTime;
import java.util.List;

public class CafeDetailsResponse {
	private final Long id;
	private final String cafeName;
	private final String brandName;
	private final String description;
	private final CafeType cafeType;
	private final String city;
	private final String state;
	private final String street;
	private final String landmark;
	private final String pincode;
	private final Double latitude;
	private final Double longitude;
	private final String cafeContactNumber;
	private final String cafeEmail;
	private final String coverImageUrl;
	private final String cafeLogoUrl;
	private final List<String> galleryImages;
	private final LocalTime openingTime;
	private final LocalTime closingTime;
	private final List<String> workingDays;
	private final boolean openNow;
	private final boolean hasHomeDelivery;
	private final boolean hasTakeaway;
	private final boolean hasDineIn;
	private final double rating;
	private final int reviewCount;
	private final int availableSeats;
	private final List<MenuCategoryResponse> menu;

	public CafeDetailsResponse(Long id, String cafeName, String brandName, String description, CafeType cafeType,
			String city, String state, String street, String landmark, String pincode, Double latitude,
			Double longitude, String cafeContactNumber, String cafeEmail, String coverImageUrl, String cafeLogoUrl,
			List<String> galleryImages, LocalTime openingTime, LocalTime closingTime, List<String> workingDays,
			boolean openNow, boolean hasHomeDelivery, boolean hasTakeaway, boolean hasDineIn, double rating,
			int reviewCount, int availableSeats, List<MenuCategoryResponse> menu) {
		this.id = id;
		this.cafeName = cafeName;
		this.brandName = brandName;
		this.description = description;
		this.cafeType = cafeType;
		this.city = city;
		this.state = state;
		this.street = street;
		this.landmark = landmark;
		this.pincode = pincode;
		this.latitude = latitude;
		this.longitude = longitude;
		this.cafeContactNumber = cafeContactNumber;
		this.cafeEmail = cafeEmail;
		this.coverImageUrl = coverImageUrl;
		this.cafeLogoUrl = cafeLogoUrl;
		this.galleryImages = galleryImages;
		this.openingTime = openingTime;
		this.closingTime = closingTime;
		this.workingDays = workingDays;
		this.openNow = openNow;
		this.hasHomeDelivery = hasHomeDelivery;
		this.hasTakeaway = hasTakeaway;
		this.hasDineIn = hasDineIn;
		this.rating = rating;
		this.reviewCount = reviewCount;
		this.availableSeats = availableSeats;
		this.menu = menu;
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

	public String getCity() {
		return city;
	}

	public String getState() {
		return state;
	}

	public String getStreet() {
		return street;
	}

	public String getLandmark() {
		return landmark;
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

	public String getCafeContactNumber() {
		return cafeContactNumber;
	}

	public String getCafeEmail() {
		return cafeEmail;
	}

	public String getCoverImageUrl() {
		return coverImageUrl;
	}

	public String getCafeLogoUrl() {
		return cafeLogoUrl;
	}

	public List<String> getGalleryImages() {
		return galleryImages;
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

	public boolean isHasHomeDelivery() {
		return hasHomeDelivery;
	}

	public boolean isHasTakeaway() {
		return hasTakeaway;
	}

	public boolean isHasDineIn() {
		return hasDineIn;
	}

	public double getRating() {
		return rating;
	}

	public int getReviewCount() {
		return reviewCount;
	}

	public int getAvailableSeats() {
		return availableSeats;
	}

	public List<MenuCategoryResponse> getMenu() {
		return menu;
	}
}
