package com.coffee.menu;

import com.coffee.cafeowner.CafeOwnerProfile;
import com.coffee.cafeowner.CafeOwnerProfileRepository;
import com.coffee.cafeowner.CafeOwnerStatus;
import com.coffee.common.NotFoundException;
import java.io.IOException;
import java.io.InputStream;
import java.nio.file.Files;
import java.nio.file.Path;
import java.nio.file.Paths;
import java.nio.file.StandardCopyOption;
import java.util.List;
import java.util.Set;
import java.util.UUID;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import org.springframework.web.multipart.MultipartFile;

@Service
public class MenuServiceImpl implements MenuService {
	private static final long MAX_IMAGE_SIZE_BYTES = 2 * 1024 * 1024;
	private static final Set<String> ALLOWED_EXTENSIONS = Set.of(".jpg", ".jpeg", ".png", ".webp");

	private final CafeOwnerProfileRepository cafeOwnerRepository;
	private final MenuCategoryRepository categoryRepository;
	private final MenuItemRepository itemRepository;
	private final Path menuUploadDir;

	public MenuServiceImpl(CafeOwnerProfileRepository cafeOwnerRepository, MenuCategoryRepository categoryRepository,
			MenuItemRepository itemRepository, @Value("${app.upload.base-dir:uploads}") String uploadBaseDir) {
		this.cafeOwnerRepository = cafeOwnerRepository;
		this.categoryRepository = categoryRepository;
		this.itemRepository = itemRepository;
		this.menuUploadDir = Paths.get(uploadBaseDir).toAbsolutePath().normalize().resolve("menu");
	}

	@Override
	@Transactional(readOnly = true)
	public List<MenuCategoryResponse> getCategories(String ownerEmail) {
		return getCategories(getApprovedOwner(ownerEmail));
	}

	@Override
	@Transactional(readOnly = true)
	public List<MenuCategoryResponse> getCategories(CafeOwnerProfile cafeOwner) {
		CafeOwnerProfile owner = requireApprovedOwner(cafeOwner);
		return categoryRepository.findByCafeOwner(owner).stream().map(this::toCategoryResponse).toList();
	}

	@Override
	@Transactional
	public MenuCategoryResponse createCategory(String ownerEmail, MenuCategoryRequest request) {
		return createCategory(getApprovedOwner(ownerEmail), request);
	}

	@Override
	@Transactional
	public MenuCategoryResponse createCategory(CafeOwnerProfile cafeOwner, MenuCategoryRequest request) {
		CafeOwnerProfile owner = requireApprovedOwner(cafeOwner);
		MenuCategory category = new MenuCategory();
		category.setCafeOwner(owner);
		category.setName(request.getName());
		category.setDescription(trimOptional(request.getDescription()));
		category.setActive(true);
		MenuCategory saved = categoryRepository.save(category);
		addItems(saved, request.getItems());
		return toCategoryResponse(saved);
	}

	@Override
	@Transactional
	public MenuCategoryResponse updateCategory(String ownerEmail, Long categoryId, MenuCategoryRequest request) {
		MenuCategory category = getOwnerCategory(ownerEmail, categoryId);
		category.setName(request.getName());
		category.setDescription(trimOptional(request.getDescription()));
		return toCategoryResponse(category);
	}

	@Override
	@Transactional
	public MenuCategoryResponse updateCategoryStatus(String ownerEmail, Long categoryId, boolean active) {
		MenuCategory category = getOwnerCategory(ownerEmail, categoryId);
		category.setActive(active);
		return toCategoryResponse(category);
	}

	@Override
	@Transactional
	public void deleteCategory(String ownerEmail, Long categoryId) {
		MenuCategory category = getOwnerCategory(ownerEmail, categoryId);
		categoryRepository.delete(category);
	}

	@Override
	@Transactional
	public MenuItemResponse addItem(String ownerEmail, Long categoryId, MenuItemRequest request) {
		return addItem(getApprovedOwner(ownerEmail), categoryId, request);
	}

	@Override
	@Transactional
	public MenuItemResponse addItem(CafeOwnerProfile cafeOwner, Long categoryId, MenuItemRequest request) {
		MenuCategory category = getOwnerCategory(cafeOwner, categoryId);
		MenuItem item = buildItem(category, request);
		MenuItem saved = itemRepository.save(item);
		return toItemResponse(saved);
	}

	@Override
	@Transactional
	public MenuItemResponse updateItem(String ownerEmail, Long itemId, MenuItemRequest request) {
		return updateItem(getApprovedOwner(ownerEmail), itemId, request);
	}

	@Override
	@Transactional
	public MenuItemResponse updateItem(CafeOwnerProfile cafeOwner, Long itemId, MenuItemRequest request) {
		MenuItem item = getOwnerItem(cafeOwner, itemId);
		item.setName(request.getName());
		item.setPrice(request.getPrice());
		item.setDescription(trimOptional(request.getDescription()));
		item.setImageUrl(trimOptional(request.getImageUrl()));
		item.setVeg(Boolean.TRUE.equals(request.getVeg()));
		item.setAvailable(Boolean.TRUE.equals(request.getAvailable()));
		return toItemResponse(item);
	}

	@Override
	@Transactional
	public MenuItemResponse updateAvailability(String ownerEmail, Long itemId, boolean available) {
		return updateAvailability(getApprovedOwner(ownerEmail), itemId, available);
	}

	@Override
	@Transactional
	public MenuItemResponse updateAvailability(CafeOwnerProfile cafeOwner, Long itemId, boolean available) {
		MenuItem item = getOwnerItem(cafeOwner, itemId);
		item.setAvailable(available);
		return toItemResponse(item);
	}

	@Override
	@Transactional
	public void deleteItem(String ownerEmail, Long itemId) {
		MenuItem item = getOwnerItem(ownerEmail, itemId);
		itemRepository.delete(item);
	}

	@Override
	@Transactional(readOnly = true)
	public String uploadItemImage(String ownerEmail, MultipartFile file) {
		getApprovedOwner(ownerEmail);
		validateImageFile(file);
		ensureUploadDirExists();
		String extension = resolveExtension(file);
		String fileName = "menu_" + UUID.randomUUID() + extension;
		Path target = menuUploadDir.resolve(fileName).normalize();
		if (!target.startsWith(menuUploadDir)) {
			throw new IllegalArgumentException("Invalid image path");
		}
		copyFile(file, target);
		return "/uploads/menu/" + fileName;
	}

	private CafeOwnerProfile getApprovedOwner(String email) {
		CafeOwnerProfile owner = cafeOwnerRepository.findByEmail(normalizeEmail(email))
				.orElseThrow(() -> new NotFoundException("Cafe owner not found"));
		return requireApprovedOwner(owner);
	}

	private CafeOwnerProfile requireApprovedOwner(CafeOwnerProfile owner) {
		if (owner == null) {
			throw new NotFoundException("Cafe owner not found");
		}
		if (owner.getStatus() != CafeOwnerStatus.ACTIVE) {
			throw new IllegalArgumentException("Cafe is not approved yet");
		}
		return owner;
	}

	private MenuCategory getOwnerCategory(String email, Long categoryId) {
		return getOwnerCategory(getApprovedOwner(email), categoryId);
	}

	private MenuCategory getOwnerCategory(CafeOwnerProfile owner, Long categoryId) {
		CafeOwnerProfile approvedOwner = requireApprovedOwner(owner);
		MenuCategory category = categoryRepository.findById(categoryId)
				.orElseThrow(() -> new NotFoundException("Category not found"));
		if (!category.getCafeOwner().getId().equals(approvedOwner.getId())) {
			throw new IllegalArgumentException("Category does not belong to owner");
		}
		return category;
	}

	private MenuItem getOwnerItem(String email, Long itemId) {
		return getOwnerItem(getApprovedOwner(email), itemId);
	}

	private MenuItem getOwnerItem(CafeOwnerProfile owner, Long itemId) {
		CafeOwnerProfile approvedOwner = requireApprovedOwner(owner);
		MenuItem item = itemRepository.findById(itemId).orElseThrow(() -> new NotFoundException("Menu item not found"));
		if (!item.getCategory().getCafeOwner().getId().equals(approvedOwner.getId())) {
			throw new IllegalArgumentException("Item does not belong to owner");
		}
		return item;
	}

	private void addItems(MenuCategory category, List<MenuItemRequest> items) {
		if (items == null || items.isEmpty()) {
			return;
		}
		for (MenuItemRequest request : items) {
			itemRepository.save(buildItem(category, request));
		}
	}

	private MenuItem buildItem(MenuCategory category, MenuItemRequest request) {
		MenuItem item = new MenuItem();
		item.setCategory(category);
		item.setName(request.getName());
		item.setPrice(request.getPrice());
		item.setDescription(trimOptional(request.getDescription()));
		item.setImageUrl(trimOptional(request.getImageUrl()));
		item.setVeg(Boolean.TRUE.equals(request.getVeg()));
		item.setAvailable(Boolean.TRUE.equals(request.getAvailable()));
		return item;
	}

	private MenuCategoryResponse toCategoryResponse(MenuCategory category) {
		List<MenuItemResponse> items = itemRepository.findByCategory(category).stream().map(this::toItemResponse)
				.toList();
		return new MenuCategoryResponse(category.getId(), category.getName(), category.getDescription(),
				category.isActive(), items);
	}

	private MenuItemResponse toItemResponse(MenuItem item) {
		return new MenuItemResponse(item.getId(), item.getName(), item.getPrice(), item.getDescription(),
				item.getImageUrl(), item.isVeg(), item.isAvailable());
	}

	private String normalizeEmail(String email) {
		return email == null ? null : email.trim().toLowerCase();
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

	private String resolveExtension(MultipartFile file) {
		String original = file.getOriginalFilename();
		if (original == null || !original.contains(".")) {
			return ".jpg";
		}
		String extension = original.substring(original.lastIndexOf(".")).toLowerCase();
		if (!ALLOWED_EXTENSIONS.contains(extension)) {
			throw new IllegalArgumentException("Supported formats: jpg, jpeg, png, webp");
		}
		return extension;
	}

	private void ensureUploadDirExists() {
		try {
			Files.createDirectories(menuUploadDir);
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
