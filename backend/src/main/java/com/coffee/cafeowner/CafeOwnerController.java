package com.coffee.cafeowner;

import jakarta.validation.Valid;
import java.util.Map;
import org.springframework.http.HttpStatus;
import org.springframework.http.MediaType;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.security.core.userdetails.UserDetails;
import org.springframework.web.bind.annotation.*;
import org.springframework.web.multipart.MultipartFile;

@RestController
@RequestMapping("/api/cafe-owners")
public class CafeOwnerController {
	private final CafeOwnerService cafeOwnerService;

	public CafeOwnerController(CafeOwnerService cafeOwnerService) {
		this.cafeOwnerService = cafeOwnerService;
	}

	@PostMapping("/register")
	public ResponseEntity<CafeOwnerResponse> register(@Valid @RequestBody CafeOwnerRegistrationRequest request) {
		CafeOwnerResponse response = cafeOwnerService.register(request);
		return ResponseEntity.status(HttpStatus.CREATED).body(response);
	}

	@PostMapping(value = "/upload-branding", consumes = MediaType.MULTIPART_FORM_DATA_VALUE)
	public ResponseEntity<Map<String, String>> uploadBrandingForSignup(@RequestParam("file") MultipartFile file) {
		String relativePath = cafeOwnerService.uploadBrandingImage(file);
		return ResponseEntity.ok(Map.of("imageUrl", relativePath));
	}

	@GetMapping("/me")
	@PreAuthorize("hasRole('CAFE_OWNER')")
	public ResponseEntity<CafeOwnerResponse> getMe(@AuthenticationPrincipal UserDetails userDetails) {
		return ResponseEntity.ok(cafeOwnerService.getByEmail(userDetails.getUsername()));
	}

	@PatchMapping("/me/visibility")
	@PreAuthorize("hasRole('CAFE_OWNER')")
	public ResponseEntity<CafeOwnerResponse> updateVisibility(@AuthenticationPrincipal UserDetails userDetails,
			@Valid @RequestBody CafeVisibilityRequest request) {
		return ResponseEntity
				.ok(cafeOwnerService.updateVisibility(userDetails.getUsername(), request.getCafeVisible()));
	}

	@PutMapping("/me")
	@PreAuthorize("hasRole('CAFE_OWNER')")
	public ResponseEntity<CafeOwnerResponse> updateProfile(@AuthenticationPrincipal UserDetails userDetails,
			@Valid @RequestBody CafeOwnerUpdateRequest request) {
		return ResponseEntity.ok(cafeOwnerService.updateProfile(userDetails.getUsername(), request));
	}

	@PutMapping("/me/compliance")
	@PreAuthorize("hasRole('CAFE_OWNER')")
	public ResponseEntity<CafeOwnerResponse> updateCompliance(@AuthenticationPrincipal UserDetails userDetails,
			@Valid @RequestBody CafeOwnerComplianceRequest request) {
		return ResponseEntity.ok(cafeOwnerService.updateCompliance(userDetails.getUsername(), request));
	}

	@PatchMapping("/me/settings")
	@PreAuthorize("hasRole('CAFE_OWNER')")
	public ResponseEntity<CafeOwnerResponse> updateSettings(@AuthenticationPrincipal UserDetails userDetails,
			@Valid @RequestBody CafeOwnerSettingsRequest request) {
		return ResponseEntity.ok(cafeOwnerService.updateSettings(userDetails.getUsername(), request));
	}

	@PostMapping(value = "/me/upload-branding", consumes = MediaType.MULTIPART_FORM_DATA_VALUE)
	@PreAuthorize("hasRole('CAFE_OWNER')")
	public ResponseEntity<Map<String, String>> uploadBranding(@AuthenticationPrincipal UserDetails userDetails,
			@RequestParam("file") MultipartFile file) {
		String relativePath = cafeOwnerService.uploadBrandingImage(userDetails.getUsername(), file);
		return ResponseEntity.ok(Map.of("imageUrl", relativePath));
	}

	@GetMapping("/{id}")
	public ResponseEntity<CafeOwnerResponse> getById(@PathVariable Long id) {
		return ResponseEntity.ok(cafeOwnerService.getById(id));
	}
}
