package com.coffee.cafeowner;

import org.springframework.web.multipart.MultipartFile;

public interface CafeOwnerService {
	CafeOwnerResponse register(CafeOwnerRegistrationRequest request);

	CafeOwnerResponse getById(Long id);

	CafeOwnerResponse getByEmail(String email);

	CafeOwnerResponse updateVisibility(String email, boolean visible);

	CafeOwnerResponse updateProfile(String email, CafeOwnerUpdateRequest request);

	CafeOwnerResponse updateCompliance(String email, CafeOwnerComplianceRequest request);

	CafeOwnerResponse updateSettings(String email, CafeOwnerSettingsRequest request);

	String uploadBrandingImage(MultipartFile file);

	String uploadBrandingImage(String email, MultipartFile file);
}
