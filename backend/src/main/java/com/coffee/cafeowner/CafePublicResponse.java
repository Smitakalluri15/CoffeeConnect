package com.coffee.cafeowner;

public class CafePublicResponse {
	private final Long id;
	private final String cafeName;
	private final String brandName;
	private final String description;
	private final CafeType cafeType;
	private final String city;
	private final String state;
	private final Double latitude;
	private final Double longitude;
	private final Double distanceKm;
	private final String cafeLogoUrl;
	private final String coverImageUrl;
	private final boolean openNow;
	private final boolean hasHomeDelivery;
	private final boolean hasTakeaway;
	private final boolean hasDineIn;

	public CafePublicResponse(Long id, String cafeName, String brandName, String description, CafeType cafeType,
			String city, String state, Double latitude, Double longitude, Double distanceKm, String cafeLogoUrl,
			String coverImageUrl, boolean openNow, boolean hasHomeDelivery, boolean hasTakeaway, boolean hasDineIn) {
		this.id = id;
		this.cafeName = cafeName;
		this.brandName = brandName;
		this.description = description;
		this.cafeType = cafeType;
		this.city = city;
		this.state = state;
		this.latitude = latitude;
		this.longitude = longitude;
		this.distanceKm = distanceKm;
		this.cafeLogoUrl = cafeLogoUrl;
		this.coverImageUrl = coverImageUrl;
		this.openNow = openNow;
		this.hasHomeDelivery = hasHomeDelivery;
		this.hasTakeaway = hasTakeaway;
		this.hasDineIn = hasDineIn;
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

	public Double getLatitude() {
		return latitude;
	}

	public Double getLongitude() {
		return longitude;
	}

	public Double getDistanceKm() {
		return distanceKm;
	}

	public String getCafeLogoUrl() {
		return cafeLogoUrl;
	}

	public String getCoverImageUrl() {
		return coverImageUrl;
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
}
