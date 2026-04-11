package com.coffee.cafeowner;

import com.coffee.menu.MenuCategoryResponse;
import java.util.List;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.RequestParam;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

@RestController
@RequestMapping("/api/cafes")
public class CafeCatalogController {
	private final CafeCatalogService cafeCatalogService;

	public CafeCatalogController(CafeCatalogService cafeCatalogService) {
		this.cafeCatalogService = cafeCatalogService;
	}

	@GetMapping
	public ResponseEntity<List<CafePublicResponse>> listActiveCafes() {
		return ResponseEntity.ok(cafeCatalogService.listActiveCafes());
	}

	@GetMapping("/nearby")
	public ResponseEntity<List<CafePublicResponse>> listNearbyCafes(@RequestParam double latitude,
			@RequestParam double longitude, @RequestParam(required = false) Double radiusKm,
			@RequestParam(required = false) Integer limit) {
		return ResponseEntity.ok(cafeCatalogService.listNearbyCafes(latitude, longitude, radiusKm, limit));
	}

	@GetMapping("/{id}")
	public ResponseEntity<CafeDetailsResponse> getCafeDetails(@PathVariable Long id) {
		return ResponseEntity.ok(cafeCatalogService.getCafeDetails(id));
	}

	@GetMapping("/{id}/menu")
	public ResponseEntity<List<MenuCategoryResponse>> getCafeMenu(@PathVariable Long id) {
		return ResponseEntity.ok(cafeCatalogService.getPublicMenu(id));
	}
}
