package com.coffee.menu;

import java.math.BigDecimal;

public class MenuItemResponse {
	private final Long id;
	private final String name;
	private final BigDecimal price;
	private final String description;
	private final String imageUrl;
	private final boolean veg;
	private final boolean available;

	public MenuItemResponse(Long id, String name, BigDecimal price, String description, String imageUrl, boolean veg,
			boolean available) {
		this.id = id;
		this.name = name;
		this.price = price;
		this.description = description;
		this.imageUrl = imageUrl;
		this.veg = veg;
		this.available = available;
	}

	public Long getId() {
		return id;
	}

	public String getName() {
		return name;
	}

	public BigDecimal getPrice() {
		return price;
	}

	public String getDescription() {
		return description;
	}

	public String getImageUrl() {
		return imageUrl;
	}

	public boolean isVeg() {
		return veg;
	}

	public boolean isAvailable() {
		return available;
	}
}
