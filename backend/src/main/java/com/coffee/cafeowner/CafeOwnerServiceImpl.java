package com.coffee.cafeowner;

import com.coffee.user.Role;
import com.coffee.user.User;
import com.coffee.user.UserRepository;
import java.io.IOException;
import java.io.InputStream;
import java.nio.file.Files;
import java.nio.file.Path;
import java.nio.file.Paths;
import java.nio.file.StandardCopyOption;
import java.util.Set;
import java.util.UUID;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import org.springframework.web.multipart.MultipartFile;

@Service
public class CafeOwnerServiceImpl implements CafeOwnerService {
	private static final Logger log = LoggerFactory.getLogger(CafeOwnerServiceImpl.class);
	private static final long MAX_IMAGE_SIZE_BYTES = 2 * 1024 * 1024;
	private static final Set<String> ALLOWED_EXTENSIONS = Set.of(".jpg", ".jpeg", ".png", ".webp");

	private final CafeOwnerProfileRepository repository;
	private final UserRepository userRepository;
	private final PasswordEncoder passwordEncoder;
	private final Path brandingUploadDir;

	public CafeOwnerServiceImpl(CafeOwnerProfileRepository repository, UserRepository userRepository,
			PasswordEncoder passwordEncoder, @Value("${app.upload.base-dir:uploads}") String uploadBaseDir) {
		this.repository = repository;
		this.userRepository = userRepository;
		this.passwordEncoder = passwordEncoder;
		this.brandingUploadDir = Paths.get(uploadBaseDir).toAbsolutePath().normalize().resolve("cafe");
	}

	@Override
	@Transactional
	public CafeOwnerResponse register(CafeOwnerRegistrationRequest request) {
		String email = normalizeEmail(request.getEmail());
		ensureEmailAvailable(email);
		String passwordHash = encodePassword(request.getPassword());
		CafeOwnerProfile profile = buildProfile(request, email, passwordHash);
		CafeOwnerProfile saved = repository.save(profile);
		createUserAccount(email, passwordHash);
		log.info("Cafe owner registered: {}", saved.getEmail());
		return CafeOwnerMapper.toResponse(saved);
	}

	@Override
	@Transactional(readOnly = true)
	public CafeOwnerResponse getById(Long id) {
		CafeOwnerProfile profile = findById(id);
		return CafeOwnerMapper.toResponse(profile);
	}

	@Override
	@Transactional(readOnly = true)
	public CafeOwnerResponse getByEmail(String email) {
		CafeOwnerProfile profile = findByEmail(email);
		return CafeOwnerMapper.toResponse(profile);
	}

	@Override
	@Transactional
	public CafeOwnerResponse updateVisibility(String email, boolean visible) {
		CafeOwnerProfile profile = findByEmail(email);
		ensureApproved(profile);
		profile.setCafeVisible(visible);
		return CafeOwnerMapper.toResponse(profile);
	}

	@Override
	@Transactional
	public CafeOwnerResponse updateProfile(String email, CafeOwnerUpdateRequest request) {
		CafeOwnerProfile profile = findByEmail(email);
		applyProfileUpdate(profile, request);
		return CafeOwnerMapper.toResponse(profile);
	}

	@Override
	@Transactional
	public CafeOwnerResponse updateCompliance(String email, CafeOwnerComplianceRequest request) {
		CafeOwnerProfile profile = findByEmail(email);
		applyComplianceUpdate(profile, request);
		profile.setVerificationStatus(VerificationStatus.UNVERIFIED);
		return CafeOwnerMapper.toResponse(profile);
	}

	@Override
	@Transactional
	public CafeOwnerResponse updateSettings(String email, CafeOwnerSettingsRequest request) {
		CafeOwnerProfile profile = findByEmail(email);
		applySettingsUpdate(profile, request);
		return CafeOwnerMapper.toResponse(profile);
	}

	@Override
	@Transactional(readOnly = true)
	public String uploadBrandingImage(String email, MultipartFile file) {
		CafeOwnerProfile owner = findByEmail(email);
		return storeBrandingImage(file, "cafe_" + owner.getId() + "_");
	}

	@Override
	@Transactional(readOnly = true)
	public String uploadBrandingImage(MultipartFile file) {
		return storeBrandingImage(file, "signup_");
	}

	private String storeBrandingImage(MultipartFile file, String prefix) {
		validateImageFile(file);
		ensureUploadDirExists();
		String extension = resolveExtension(file.getOriginalFilename());
		String fileName = prefix + UUID.randomUUID() + extension;
		Path target = brandingUploadDir.resolve(fileName).normalize();
		if (!target.startsWith(brandingUploadDir)) {
			throw new IllegalArgumentException("Invalid image path");
		}
		copyFile(file, target);
		return "/uploads/cafe/" + fileName;
	}

	private String normalizeEmail(String email) {
		return email == null ? null : email.trim().toLowerCase();
	}

	private void ensureEmailAvailable(String email) {
		if (repository.existsByEmail(email) || userRepository.existsByEmail(email)) {
			throw new CafeOwnerAlreadyExistsException("Email already registered");
		}
	}

	private String encodePassword(String rawPassword) {
		return passwordEncoder.encode(rawPassword);
	}

	private CafeOwnerProfile buildProfile(CafeOwnerRegistrationRequest request, String email, String passwordHash) {
		CafeOwnerProfile profile = new CafeOwnerProfile();
		applyCafeInfo(profile, request);
		applyOwnerAccount(profile, request, email, passwordHash);
		applyContact(profile, request);
		applyOperating(profile, request);
		applyLocation(profile, request);
		applyDocuments(profile, request);
		applyBranding(profile, request);
		applyPayments(profile, request);
		applySettings(profile, request);
		applyMenuSetup(profile, request);
		applyDefaults(profile);
		return profile;
	}

	private void applyCafeInfo(CafeOwnerProfile profile, CafeOwnerRegistrationRequest request) {
		profile.setCafeName(request.getCafeName());
		profile.setBrandName(trimOptional(request.getBrandName()));
		profile.setDescription(trimOptional(request.getDescription()));
		profile.setCafeType(request.getCafeType());
		profile.setOpeningDate(request.getOpeningDate());
	}

	private void applyOwnerAccount(CafeOwnerProfile profile, CafeOwnerRegistrationRequest request, String email,
			String passwordHash) {
		profile.setOwnerName(request.getOwnerName());
		profile.setContactNumber(request.getContactNumber());
		profile.setEmail(email);
		profile.setPasswordHash(passwordHash);
	}

	private void applyContact(CafeOwnerProfile profile, CafeOwnerRegistrationRequest request) {
		profile.setCafeContactNumber(request.getCafeContactNumber());
		profile.setCafeEmail(request.getCafeEmail());
		profile.setWhatsappNumber(trimOptional(request.getWhatsappNumber()));
	}

	private void applyOperating(CafeOwnerProfile profile, CafeOwnerRegistrationRequest request) {
		profile.setOpeningTime(request.getOpeningTime());
		profile.setClosingTime(request.getClosingTime());
		profile.setWorkingDays(CafeOwnerMapper.toCsv(request.getWorkingDays()));
		profile.setHasHomeDelivery(Boolean.TRUE.equals(request.getHasHomeDelivery()));
		profile.setHasTakeaway(Boolean.TRUE.equals(request.getHasTakeaway()));
		profile.setHasDineIn(Boolean.TRUE.equals(request.getHasDineIn()));
	}

	private void applyLocation(CafeOwnerProfile profile, CafeOwnerRegistrationRequest request) {
		profile.setStreet(request.getStreet());
		profile.setLandmark(trimOptional(request.getLandmark()));
		profile.setCity(request.getCity());
		profile.setState(request.getState());
		profile.setPincode(request.getPincode());
		profile.setLatitude(request.getLatitude());
		profile.setLongitude(request.getLongitude());
	}

	private void applyDocuments(CafeOwnerProfile profile, CafeOwnerRegistrationRequest request) {
		profile.setFssaiLicenseNumber(request.getFssaiLicenseNumber());
		profile.setGstNumber(trimOptional(request.getGstNumber()));
		profile.setShopPhotoUrl(trimOptional(request.getShopPhotoUrl()));
		profile.setLicenseDocumentUrl(trimOptional(request.getLicenseDocumentUrl()));
		profile.setOwnerIdProofUrl(trimOptional(request.getOwnerIdProofUrl()));
	}

	private void applyBranding(CafeOwnerProfile profile, CafeOwnerRegistrationRequest request) {
		profile.setCafeLogoUrl(trimOptional(request.getCafeLogoUrl()));
		profile.setCoverImageUrl(trimOptional(request.getCoverImageUrl()));
		profile.setGalleryImages(trimOptional(request.getGalleryImages()));
	}

	private void applyPayments(CafeOwnerProfile profile, CafeOwnerRegistrationRequest request) {
		profile.setAccountHolderName(trimOptional(request.getAccountHolderName()));
		profile.setAccountNumber(trimOptional(request.getAccountNumber()));
		profile.setIfscCode(trimOptional(request.getIfscCode()));
		profile.setUpiId(trimOptional(request.getUpiId()));
		profile.setAcceptCash(Boolean.TRUE.equals(request.getAcceptCash()));
	}

	private void applySettings(CafeOwnerProfile profile, CafeOwnerRegistrationRequest request) {
		profile.setCafeVisible(Boolean.TRUE.equals(request.getCafeVisible()));
		profile.setOrdersPaused(Boolean.TRUE.equals(request.getOrdersPaused()));
		profile.setMinOrderValue(request.getMinOrderValue());
		profile.setPrepTimeMinutes(request.getPrepTimeMinutes());
	}

	private void applyProfileUpdate(CafeOwnerProfile profile, CafeOwnerUpdateRequest request) {
		applyCafeBasicsUpdate(profile, request);
		applyCafeContactUpdate(profile, request);
		applyCafeAddressUpdate(profile, request);
		applyCafeBrandingUpdate(profile, request);
		applyCafeScheduleUpdate(profile, request);
	}

	private void applyComplianceUpdate(CafeOwnerProfile profile, CafeOwnerComplianceRequest request) {
		profile.setFssaiLicenseNumber(request.getFssaiLicenseNumber());
		profile.setGstNumber(trimOptional(request.getGstNumber()));
		profile.setLicenseDocumentUrl(trimOptional(request.getLicenseDocumentUrl()));
		profile.setShopPhotoUrl(trimOptional(request.getShopPhotoUrl()));
		profile.setOwnerIdProofUrl(trimOptional(request.getOwnerIdProofUrl()));
	}

	private void applySettingsUpdate(CafeOwnerProfile profile, CafeOwnerSettingsRequest request) {
		profile.setCafeVisible(Boolean.TRUE.equals(request.getCafeVisible()));
		profile.setOrdersPaused(Boolean.TRUE.equals(request.getOrdersPaused()));
		profile.setMinOrderValue(request.getMinOrderValue());
		profile.setPrepTimeMinutes(request.getPrepTimeMinutes());
	}

	private void applyCafeBasicsUpdate(CafeOwnerProfile profile, CafeOwnerUpdateRequest request) {
		profile.setCafeName(request.getCafeName());
		profile.setBrandName(trimOptional(request.getBrandName()));
		profile.setDescription(trimOptional(request.getDescription()));
		profile.setCafeType(request.getCafeType());
		profile.setOpeningDate(request.getOpeningDate());
	}

	private void applyCafeContactUpdate(CafeOwnerProfile profile, CafeOwnerUpdateRequest request) {
		profile.setCafeContactNumber(request.getCafeContactNumber());
		profile.setCafeEmail(request.getCafeEmail());
		profile.setWhatsappNumber(trimOptional(request.getWhatsappNumber()));
	}

	private void applyCafeAddressUpdate(CafeOwnerProfile profile, CafeOwnerUpdateRequest request) {
		profile.setStreet(request.getStreet());
		profile.setLandmark(trimOptional(request.getLandmark()));
		profile.setCity(request.getCity());
		profile.setState(request.getState());
		profile.setPincode(request.getPincode());
		profile.setLatitude(request.getLatitude());
		profile.setLongitude(request.getLongitude());
	}

	private void applyCafeBrandingUpdate(CafeOwnerProfile profile, CafeOwnerUpdateRequest request) {
		profile.setCafeLogoUrl(trimOptional(request.getCafeLogoUrl()));
		profile.setCoverImageUrl(trimOptional(request.getCoverImageUrl()));
		profile.setGalleryImages(trimOptional(request.getGalleryImages()));
	}

	private void applyCafeScheduleUpdate(CafeOwnerProfile profile, CafeOwnerUpdateRequest request) {
		profile.setWorkingDays(CafeOwnerMapper.toCsv(request.getWorkingDays()));
	}

	private void applyMenuSetup(CafeOwnerProfile profile, CafeOwnerRegistrationRequest request) {
		if (request.getMenuCategories() == null || request.getMenuCategories().isEmpty()) {
			return;
		}
		request.getMenuCategories()
				.forEach(categoryRequest -> profile.getMenuCategories().add(buildCategory(profile, categoryRequest)));
	}

	private com.coffee.menu.MenuCategory buildCategory(CafeOwnerProfile profile,
			com.coffee.menu.MenuCategoryRequest request) {
		com.coffee.menu.MenuCategory category = new com.coffee.menu.MenuCategory();
		category.setCafeOwner(profile);
		category.setName(request.getName());
		category.setDescription(trimOptional(request.getDescription()));
		category.setActive(true);
		category.setItems(buildItems(category, request.getItems()));
		return category;
	}

	private java.util.List<com.coffee.menu.MenuItem> buildItems(com.coffee.menu.MenuCategory category,
			java.util.List<com.coffee.menu.MenuItemRequest> items) {
		java.util.List<com.coffee.menu.MenuItem> mapped = new java.util.ArrayList<>();
		if (items == null) {
			return mapped;
		}
		for (com.coffee.menu.MenuItemRequest request : items) {
			com.coffee.menu.MenuItem item = new com.coffee.menu.MenuItem();
			item.setCategory(category);
			item.setName(request.getName());
			item.setPrice(request.getPrice());
			item.setDescription(trimOptional(request.getDescription()));
			item.setImageUrl(trimOptional(request.getImageUrl()));
			item.setVeg(Boolean.TRUE.equals(request.getVeg()));
			item.setAvailable(Boolean.TRUE.equals(request.getAvailable()));
			mapped.add(item);
		}
		return mapped;
	}

	private void applyDefaults(CafeOwnerProfile profile) {
		profile.setStatus(CafeOwnerStatus.PENDING);
		profile.setVerificationStatus(VerificationStatus.UNVERIFIED);
	}

	private void createUserAccount(String email, String passwordHash) {
		User user = new User();
		user.setEmail(email);
		user.setPasswordHash(passwordHash);
		user.setRole(Role.CAFE_OWNER);
		user.setActive(true);
		user.setEmailVerified(true);
		user.setMustResetPassword(false);
		userRepository.save(user);
	}

	private CafeOwnerProfile findById(Long id) {
		return repository.findById(id).orElseThrow(() -> new CafeOwnerNotFoundException("Cafe owner not found"));
	}

	private CafeOwnerProfile findByEmail(String email) {
		String normalized = normalizeEmail(email);
		return repository.findByEmail(normalized)
				.orElseThrow(() -> new CafeOwnerNotFoundException("Cafe owner not found"));
	}

	private void ensureApproved(CafeOwnerProfile profile) {
		if (profile.getStatus() != CafeOwnerStatus.ACTIVE) {
			throw new IllegalArgumentException("Cafe is not approved yet");
		}
	}

	private String trimOptional(String value) {
		if (value == null) {
			return null;
		}
		String trimmed = value.trim();
		return trimmed.isEmpty() ? null : trimmed;
	}

	private void validateImageFile(MultipartFile file) {
		if (file == null || file.isEmpty()) {
			throw new IllegalArgumentException("Image file is required");
		}
		if (file.getSize() > MAX_IMAGE_SIZE_BYTES) {
			throw new IllegalArgumentException("Image must be 2MB or smaller");
		}
		String contentType = file.getContentType();
		if (contentType == null || !contentType.startsWith("image/")) {
			throw new IllegalArgumentException("Only image files are allowed");
		}
	}

	private String resolveExtension(String originalFileName) {
		if (originalFileName == null || !originalFileName.contains(".")) {
			return ".jpg";
		}
		String extension = originalFileName.substring(originalFileName.lastIndexOf(".")).toLowerCase();
		if (!ALLOWED_EXTENSIONS.contains(extension)) {
			throw new IllegalArgumentException("Supported formats: jpg, jpeg, png, webp");
		}
		return extension;
	}

	private void ensureUploadDirExists() {
		try {
			Files.createDirectories(brandingUploadDir);
		} catch (IOException ex) {
			throw new IllegalArgumentException("Failed to prepare image storage");
		}
	}

	private void copyFile(MultipartFile file, Path target) {
		try (InputStream input = file.getInputStream()) {
			Files.copy(input, target, StandardCopyOption.REPLACE_EXISTING);
		} catch (IOException ex) {
			throw new IllegalArgumentException("Failed to store image");
		}
	}

}
