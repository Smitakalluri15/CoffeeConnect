package com.coffee.menu;

import jakarta.validation.Valid;
import java.util.List;
import java.util.Map;
import org.springframework.http.MediaType;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.security.core.userdetails.UserDetails;
import org.springframework.web.multipart.MultipartFile;
import org.springframework.web.servlet.support.ServletUriComponentsBuilder;
import org.springframework.web.bind.annotation.*;

@RestController
@RequestMapping("/api/cafe-owner/menu")
@PreAuthorize("hasRole('CAFE_OWNER')")
public class MenuController {
	private final MenuService menuService;

	public MenuController(MenuService menuService) {
		this.menuService = menuService;
	}

	@GetMapping("/categories")
	public ResponseEntity<List<MenuCategoryResponse>> getCategories(@AuthenticationPrincipal UserDetails userDetails) {
		return ResponseEntity.ok(menuService.getCategories(userDetails.getUsername()));
	}

	@PostMapping("/categories")
	public ResponseEntity<MenuCategoryResponse> createCategory(@AuthenticationPrincipal UserDetails userDetails,
			@Valid @RequestBody MenuCategoryRequest request) {
		return ResponseEntity.ok(menuService.createCategory(userDetails.getUsername(), request));
	}

	@PutMapping("/categories/{id}")
	public ResponseEntity<MenuCategoryResponse> updateCategory(@AuthenticationPrincipal UserDetails userDetails,
			@PathVariable Long id, @Valid @RequestBody MenuCategoryRequest request) {
		return ResponseEntity.ok(menuService.updateCategory(userDetails.getUsername(), id, request));
	}

	@PatchMapping("/categories/{id}/status")
	public ResponseEntity<MenuCategoryResponse> updateCategoryStatus(@AuthenticationPrincipal UserDetails userDetails,
			@PathVariable Long id, @Valid @RequestBody MenuCategoryStatusRequest request) {
		return ResponseEntity.ok(menuService.updateCategoryStatus(userDetails.getUsername(), id, request.getActive()));
	}

	@DeleteMapping("/categories/{id}")
	public ResponseEntity<Void> deleteCategory(@AuthenticationPrincipal UserDetails userDetails,
			@PathVariable Long id) {
		menuService.deleteCategory(userDetails.getUsername(), id);
		return ResponseEntity.noContent().build();
	}

	@PostMapping("/categories/{id}/items")
	public ResponseEntity<MenuItemResponse> addItem(@AuthenticationPrincipal UserDetails userDetails,
			@PathVariable Long id, @Valid @RequestBody MenuItemRequest request) {
		return ResponseEntity.ok(menuService.addItem(userDetails.getUsername(), id, request));
	}

	@PutMapping("/items/{id}")
	public ResponseEntity<MenuItemResponse> updateItem(@AuthenticationPrincipal UserDetails userDetails,
			@PathVariable Long id, @Valid @RequestBody MenuItemRequest request) {
		return ResponseEntity.ok(menuService.updateItem(userDetails.getUsername(), id, request));
	}

	@PatchMapping("/items/{id}/availability")
	public ResponseEntity<MenuItemResponse> updateAvailability(@AuthenticationPrincipal UserDetails userDetails,
			@PathVariable Long id, @Valid @RequestBody MenuItemAvailabilityRequest request) {
		return ResponseEntity.ok(menuService.updateAvailability(userDetails.getUsername(), id, request.getAvailable()));
	}

	@DeleteMapping("/items/{id}")
	public ResponseEntity<Void> deleteItem(@AuthenticationPrincipal UserDetails userDetails, @PathVariable Long id) {
		menuService.deleteItem(userDetails.getUsername(), id);
		return ResponseEntity.noContent().build();
	}

	@PostMapping(value = "/items/upload", consumes = MediaType.MULTIPART_FORM_DATA_VALUE)
	public ResponseEntity<Map<String, String>> uploadItemImage(@AuthenticationPrincipal UserDetails userDetails,
			@RequestPart("file") MultipartFile file) {
		String relativePath = menuService.uploadItemImage(userDetails.getUsername(), file);
		String imageUrl = ServletUriComponentsBuilder.fromCurrentContextPath().path(relativePath).toUriString();
		return ResponseEntity.ok(Map.of("imageUrl", imageUrl));
	}
}
