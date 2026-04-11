package com.coffee.staff;

import com.coffee.user.Role;
import jakarta.validation.Valid;
import java.util.List;
import java.util.Map;
import org.springframework.http.MediaType;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.security.core.userdetails.UserDetails;
import org.springframework.web.bind.annotation.DeleteMapping;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PatchMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.PutMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RequestParam;
import org.springframework.web.bind.annotation.RequestPart;
import org.springframework.web.bind.annotation.RestController;
import org.springframework.web.multipart.MultipartFile;
import org.springframework.web.servlet.support.ServletUriComponentsBuilder;

@RestController
@RequestMapping("/api/cafe-owner/staff")
@PreAuthorize("hasRole('CAFE_OWNER')")
public class OwnerStaffController {
	private final StaffService staffService;

	public OwnerStaffController(StaffService staffService) {
		this.staffService = staffService;
	}

	@PostMapping("/chefs")
	public ResponseEntity<StaffResponse> createChef(@AuthenticationPrincipal UserDetails userDetails,
			@Valid @RequestBody ChefCreateRequest request) {
		return ResponseEntity.ok(staffService.createChef(userDetails.getUsername(), request));
	}

	@PostMapping("/waiters")
	public ResponseEntity<StaffResponse> createWaiter(@AuthenticationPrincipal UserDetails userDetails,
			@Valid @RequestBody WaiterCreateRequest request) {
		return ResponseEntity.ok(staffService.createWaiter(userDetails.getUsername(), request));
	}

	@GetMapping
	public ResponseEntity<List<StaffResponse>> listStaff(@AuthenticationPrincipal UserDetails userDetails,
			@RequestParam(required = false) Role role) {
		return ResponseEntity.ok(staffService.listByOwner(userDetails.getUsername(), role));
	}

	@PutMapping("/{id}")
	public ResponseEntity<StaffResponse> updateStaff(@AuthenticationPrincipal UserDetails userDetails,
			@PathVariable Long id, @Valid @RequestBody StaffUpdateRequest request) {
		return ResponseEntity.ok(staffService.update(userDetails.getUsername(), id, request));
	}

	@PatchMapping("/{id}/status")
	public ResponseEntity<StaffResponse> updateStaffStatus(@AuthenticationPrincipal UserDetails userDetails,
			@PathVariable Long id, @Valid @RequestBody StaffStatusRequest request) {
		return ResponseEntity.ok(staffService.updateStatus(userDetails.getUsername(), id, request.getStatus()));
	}

	@DeleteMapping("/{id}")
	public ResponseEntity<Void> deleteStaff(@AuthenticationPrincipal UserDetails userDetails, @PathVariable Long id) {
		staffService.delete(userDetails.getUsername(), id);
		return ResponseEntity.noContent().build();
	}

	@PostMapping(value = "/upload-photo", consumes = MediaType.MULTIPART_FORM_DATA_VALUE)
	public ResponseEntity<Map<String, String>> uploadPhoto(@AuthenticationPrincipal UserDetails userDetails,
			@RequestPart("file") MultipartFile file) {
		String relativePath = staffService.uploadPhoto(userDetails.getUsername(), file);
		String photoUrl = ServletUriComponentsBuilder.fromCurrentContextPath().path(relativePath).toUriString();
		return ResponseEntity.ok(Map.of("photoUrl", photoUrl));
	}
}
