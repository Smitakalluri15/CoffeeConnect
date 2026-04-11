package com.coffee.menu;

import com.coffee.cafeowner.CafeOwnerProfile;
import java.util.List;
import org.springframework.web.multipart.MultipartFile;

public interface MenuService {
	List<MenuCategoryResponse> getCategories(String ownerEmail);

	List<MenuCategoryResponse> getCategories(CafeOwnerProfile cafeOwner);

	MenuCategoryResponse createCategory(String ownerEmail, MenuCategoryRequest request);

	MenuCategoryResponse createCategory(CafeOwnerProfile cafeOwner, MenuCategoryRequest request);

	MenuCategoryResponse updateCategory(String ownerEmail, Long categoryId, MenuCategoryRequest request);

	MenuCategoryResponse updateCategoryStatus(String ownerEmail, Long categoryId, boolean active);

	void deleteCategory(String ownerEmail, Long categoryId);

	MenuItemResponse addItem(String ownerEmail, Long categoryId, MenuItemRequest request);

	MenuItemResponse addItem(CafeOwnerProfile cafeOwner, Long categoryId, MenuItemRequest request);

	MenuItemResponse updateItem(String ownerEmail, Long itemId, MenuItemRequest request);

	MenuItemResponse updateItem(CafeOwnerProfile cafeOwner, Long itemId, MenuItemRequest request);

	MenuItemResponse updateAvailability(String ownerEmail, Long itemId, boolean available);

	MenuItemResponse updateAvailability(CafeOwnerProfile cafeOwner, Long itemId, boolean available);

	void deleteItem(String ownerEmail, Long itemId);

	String uploadItemImage(String ownerEmail, MultipartFile file);
}
