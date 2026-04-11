package com.coffee.menu;

import com.coffee.cafeowner.CafeOwnerProfile;
import java.util.List;
import org.springframework.data.jpa.repository.JpaRepository;

public interface MenuCategoryRepository extends JpaRepository<MenuCategory, Long> {
	List<MenuCategory> findByCafeOwner(CafeOwnerProfile cafeOwner);

	List<MenuCategory> findByCafeOwnerAndActiveTrue(CafeOwnerProfile cafeOwner);
}
