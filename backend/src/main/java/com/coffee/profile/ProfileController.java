package com.coffee.profile;

import jakarta.validation.Valid;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.security.core.userdetails.UserDetails;
import org.springframework.web.bind.annotation.*;

@RestController
@RequestMapping("/api/profile")
public class ProfileController {
	private final ProfileService profileService;

	public ProfileController(ProfileService profileService) {
		this.profileService = profileService;
	}

	@GetMapping("/me")
	public ResponseEntity<ProfileResponse> getMe(@AuthenticationPrincipal UserDetails userDetails) {
		return ResponseEntity.ok(profileService.getProfile(userDetails.getUsername()));
	}

	@PutMapping("/me")
	public ResponseEntity<ProfileResponse> updateMe(@AuthenticationPrincipal UserDetails userDetails,
			@Valid @RequestBody ProfileRequest request) {
		return ResponseEntity.ok(profileService.updateProfile(userDetails.getUsername(), request));
	}
}
