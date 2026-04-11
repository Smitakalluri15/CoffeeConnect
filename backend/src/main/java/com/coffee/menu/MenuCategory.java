package com.coffee.menu;

import com.coffee.cafeowner.CafeOwnerProfile;
import jakarta.persistence.CascadeType;
import jakarta.persistence.Column;
import jakarta.persistence.Entity;
import jakarta.persistence.GeneratedValue;
import jakarta.persistence.GenerationType;
import jakarta.persistence.Id;
import jakarta.persistence.ManyToOne;
import jakarta.persistence.OneToMany;
import jakarta.persistence.Table;
import java.util.ArrayList;
import java.util.List;

@Entity
@Table(name = "menu_categories")
public class MenuCategory {
	@Id
	@GeneratedValue(strategy = GenerationType.IDENTITY)
	private Long id;

	@ManyToOne(optional = false)
	private CafeOwnerProfile cafeOwner;

	@Column(nullable = false, length = 80)
	private String name;

	@Column(length = 300)
	private String description;

	@Column(nullable = false)
	private boolean active;

	@OneToMany(mappedBy = "category", cascade = CascadeType.ALL, orphanRemoval = true)
	private List<MenuItem> items = new ArrayList<>();

	public Long getId() {
		return id;
	}

	public CafeOwnerProfile getCafeOwner() {
		return cafeOwner;
	}

	public void setCafeOwner(CafeOwnerProfile cafeOwner) {
		this.cafeOwner = cafeOwner;
	}

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

	public boolean isActive() {
		return active;
	}

	public void setActive(boolean active) {
		this.active = active;
	}

	public List<MenuItem> getItems() {
		return items;
	}

	public void setItems(List<MenuItem> items) {
		this.items = items;
	}
}
