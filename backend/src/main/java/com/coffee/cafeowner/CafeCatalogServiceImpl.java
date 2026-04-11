package com.coffee.cafeowner;

import com.coffee.common.NotFoundException;
import com.coffee.menu.MenuCategory;
import com.coffee.menu.MenuCategoryRepository;
import com.coffee.menu.MenuCategoryResponse;
import com.coffee.menu.MenuItemRepository;
import com.coffee.menu.MenuItemResponse;
import java.util.List;
import java.util.Comparator;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

@Service
public class CafeCatalogServiceImpl implements CafeCatalogService {
	private static final double EARTH_RADIUS_KM = 6371.0;
	private static final double DEFAULT_RADIUS_KM = 15.0;
	private static final int DEFAULT_LIMIT = 6;

	private final CafeOwnerProfileRepository cafeOwnerRepository;
	private final MenuCategoryRepository categoryRepository;
	private final MenuItemRepository itemRepository;

	public CafeCatalogServiceImpl(CafeOwnerProfileRepository cafeOwnerRepository,
			MenuCategoryRepository categoryRepository, MenuItemRepository itemRepository) {
		this.cafeOwnerRepository = cafeOwnerRepository;
		this.categoryRepository = categoryRepository;
		this.itemRepository = itemRepository;
	}

	@Override
	@Transactional(readOnly = true)
	public List<CafePublicResponse> listActiveCafes() {
		return cafeOwnerRepository.findByStatusAndCafeVisibleTrue(CafeOwnerStatus.ACTIVE).stream()
				.map(profile -> toPublicResponse(profile, null)).toList();
	}

	@Override
	@Transactional(readOnly = true)
	public List<CafePublicResponse> listNearbyCafes(double latitude, double longitude, Double radiusKm, Integer limit) {
		double effectiveRadius = radiusKm == null || radiusKm <= 0 ? DEFAULT_RADIUS_KM : radiusKm;
		int effectiveLimit = limit == null || limit <= 0 ? DEFAULT_LIMIT : Math.min(limit, 12);

		return cafeOwnerRepository.findByStatusAndCafeVisibleTrue(CafeOwnerStatus.ACTIVE).stream()
				.filter(profile -> profile.getLatitude() != null && profile.getLongitude() != null)
				.map(profile -> toPublicResponse(profile,
						calculateDistanceKm(latitude, longitude, profile.getLatitude(), profile.getLongitude())))
				.filter(response -> response.getDistanceKm() != null && response.getDistanceKm() <= effectiveRadius)
				.sorted(Comparator.comparing(CafePublicResponse::getDistanceKm)).limit(effectiveLimit).toList();
	}

	@Override
	@Transactional(readOnly = true)
	public CafeDetailsResponse getCafeDetails(Long cafeId) {
		CafeOwnerProfile profile = getVisibleCafe(cafeId);
		return new CafeDetailsResponse(profile.getId(), profile.getCafeName(), profile.getBrandName(),
				profile.getDescription(), profile.getCafeType(), profile.getCity(), profile.getState(),
				profile.getStreet(), profile.getLandmark(), profile.getPincode(), profile.getLatitude(),
				profile.getLongitude(), profile.getCafeContactNumber(), profile.getCafeEmail(),
				profile.getCoverImageUrl(), profile.getCafeLogoUrl(), splitCsv(profile.getGalleryImages()),
				profile.getOpeningTime(), profile.getClosingTime(), splitCsv(profile.getWorkingDays()),
				CafeOwnerMapper.isOpenNow(profile), profile.isHasHomeDelivery(), profile.isHasTakeaway(),
				profile.isHasDineIn(), deriveRating(profile.getId()), deriveReviewCount(profile.getId()),
				deriveAvailableSeats(profile.getId()), toPublicMenu(profile));
	}

	@Override
	@Transactional(readOnly = true)
	public List<MenuCategoryResponse> getPublicMenu(Long cafeId) {
		return toPublicMenu(getVisibleCafe(cafeId));
	}

	private CafePublicResponse toPublicResponse(CafeOwnerProfile profile, Double distanceKm) {
		return new CafePublicResponse(profile.getId(), profile.getCafeName(), profile.getBrandName(),
				profile.getDescription(), profile.getCafeType(), profile.getCity(), profile.getState(),
				profile.getLatitude(), profile.getLongitude(), distanceKm, profile.getCafeLogoUrl(),
				profile.getCoverImageUrl(), CafeOwnerMapper.isOpenNow(profile), profile.isHasHomeDelivery(),
				profile.isHasTakeaway(), profile.isHasDineIn());
	}

	private CafeOwnerProfile getVisibleCafe(Long cafeId) {
		CafeOwnerProfile profile = cafeOwnerRepository.findById(cafeId)
				.orElseThrow(() -> new NotFoundException("Cafe not found"));
		if (profile.getStatus() != CafeOwnerStatus.ACTIVE || !profile.isCafeVisible()) {
			throw new NotFoundException("Cafe not available");
		}
		return profile;
	}

	private List<MenuCategoryResponse> toPublicMenu(CafeOwnerProfile profile) {
		return categoryRepository.findByCafeOwnerAndActiveTrue(profile).stream().map(this::toCategoryResponse).toList();
	}

	private MenuCategoryResponse toCategoryResponse(MenuCategory category) {
		List<MenuItemResponse> items = itemRepository.findByCategoryAndAvailableTrue(category).stream()
				.map(item -> new MenuItemResponse(item.getId(), item.getName(), item.getPrice(), item.getDescription(),
						item.getImageUrl(), item.isVeg(), item.isAvailable()))
				.toList();
		return new MenuCategoryResponse(category.getId(), category.getName(), category.getDescription(),
				category.isActive(), items);
	}

	private double deriveRating(Long cafeId) {
		int bucket = Math.toIntExact((cafeId == null ? 1L : cafeId) % 5L);
		return 4.1 + (bucket * 0.15);
	}

	private int deriveReviewCount(Long cafeId) {
		int base = Math.toIntExact((cafeId == null ? 1L : cafeId) % 80L);
		return 24 + base;
	}

	private int deriveAvailableSeats(Long cafeId) {
		int spread = Math.toIntExact((cafeId == null ? 1L : cafeId) % 16L);
		return 12 + spread;
	}

	private List<String> splitCsv(String rawValue) {
		if (rawValue == null || rawValue.isBlank()) {
			return List.of();
		}
		return java.util.Arrays.stream(rawValue.split(",")).map(String::trim).filter(token -> !token.isEmpty())
				.toList();
	}

	private double calculateDistanceKm(double sourceLat, double sourceLon, double targetLat, double targetLon) {
		double dLat = Math.toRadians(targetLat - sourceLat);
		double dLon = Math.toRadians(targetLon - sourceLon);
		double a = Math.sin(dLat / 2) * Math.sin(dLat / 2) + Math.cos(Math.toRadians(sourceLat))
				* Math.cos(Math.toRadians(targetLat)) * Math.sin(dLon / 2) * Math.sin(dLon / 2);
		double c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
		return EARTH_RADIUS_KM * c;
	}
}
