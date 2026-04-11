package com.coffee.menu;

import jakarta.validation.Valid;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.Size;
import java.util.List;

public class MenuCategoryRequest {
	@NotBlank(message = "{menu.category.name.required}")
	@Size(max = 80, message = "{menu.category.name.size}")
	private String name;

	@Size(max = 300, message = "{menu.category.description.size}")
	private String description;

	@Valid
	private List<MenuItemRequest> items;

	public String getName() {
		return name;
	}

	public void setName(String name) {
		this.name = name;
	}

	public String getDescription() {
		return description;
	}

	public void setDescription(String description) {
		this.description = description;
	}

	public List<MenuItemRequest> getItems() {
		return items;
	}

	public void setItems(List<MenuItemRequest> items) {
		this.items = items;
	}
}
