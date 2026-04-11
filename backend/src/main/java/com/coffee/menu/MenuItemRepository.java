package com.coffee.menu;

import java.util.List;
import org.springframework.data.jpa.repository.JpaRepository;

public interface MenuItemRepository extends JpaRepository<MenuItem, Long> {
	List<MenuItem> findByCategory(MenuCategory category);

	List<MenuItem> findByCategoryAndAvailableTrue(MenuCategory category);
}
