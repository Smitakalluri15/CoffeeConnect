package com.coffee.menu;

import jakarta.validation.constraints.DecimalMin;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;
import jakarta.validation.constraints.Size;
import java.math.BigDecimal;

public class MenuItemRequest {
	@NotBlank(message = "{menu.item.name.required}")
	@Size(max = 120, message = "{menu.item.name.size}")
	private String name;

	@NotNull(message = "{menu.item.price.required}")
	@DecimalMin(value = "0.0", message = "{menu.item.price.invalid}")
	private BigDecimal price;

	@Size(max = 400, message = "{menu.item.description.size}")
	private String description;

	@Size(max = 800000, message = "{menu.item.image.size}")
	private String imageUrl;

	@NotNull(message = "{menu.item.veg.required}")
	private Boolean veg;

	@NotNull(message = "{menu.item.available.required}")
	private Boolean available;

	public String getName() {
		return name;
	}

	public void setName(String name) {
		this.name = name;
	}

	public BigDecimal getPrice() {
		return price;
	}

	public void setPrice(BigDecimal price) {
		this.price = price;
	}

	public String getDescription() {
		return description;
	}

	public void setDescription(String description) {
		this.description = description;
	}

	public String getImageUrl() {
		return imageUrl;
	}

	public void setImageUrl(String imageUrl) {
		this.imageUrl = imageUrl;
	}

	public Boolean getVeg() {
		return veg;
	}

	public void setVeg(Boolean veg) {
		this.veg = veg;
	}

	public Boolean getAvailable() {
		return available;
	}

	public void setAvailable(Boolean available) {
		this.available = available;
	}
}
