package com.coffee.menu;

import java.util.List;

public class MenuCategoryResponse {
	private final Long id;
	private final String name;
	private final String description;
	private final boolean active;
	private final List<MenuItemResponse> items;

	public MenuCategoryResponse(Long id, String name, String description, boolean active,
			List<MenuItemResponse> items) {
		this.id = id;
		this.name = name;
		this.description = description;
		this.active = active;
		this.items = items;
	}

	public Long getId() {
		return id;
	}

	public String getName() {
		return name;
	}

	public String getDescription() {
		return description;
	}

	public boolean isActive() {
		return active;
	}

	public List<MenuItemResponse> getItems() {
		return items;
	}
}
