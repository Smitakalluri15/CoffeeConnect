package com.coffee.cafeowner;

import java.time.DayOfWeek;
import java.time.LocalDate;
import java.time.LocalTime;
import java.util.ArrayList;
import java.util.EnumSet;
import java.util.List;
import java.util.Locale;
import java.util.Set;
import java.util.stream.Collectors;

public final class CafeOwnerMapper {
	private CafeOwnerMapper() {
	}

	public static CafeOwnerResponse toResponse(CafeOwnerProfile profile) {
		List<String> workingDays = splitCsv(profile.getWorkingDays(), true);
		List<String> galleryImages = splitCsv(profile.getGalleryImages(), false);
		boolean openNow = isOpenNow(profile.getOpeningTime(), profile.getClosingTime(), workingDays);

		return new CafeOwnerResponse(profile.getId(), profile.getCafeName(), profile.getBrandName(),
				profile.getDescription(), profile.getCafeType(), profile.getOpeningDate(), profile.getOwnerName(),
				profile.getContactNumber(), profile.getEmail(), profile.getCafeContactNumber(), profile.getCafeEmail(),
				profile.getWhatsappNumber(), profile.getOpeningTime(), profile.getClosingTime(), workingDays, openNow,
				profile.getStreet(), profile.getLandmark(), profile.getCity(), profile.getState(), profile.getPincode(),
				profile.getLatitude(), profile.getLongitude(), profile.getFssaiLicenseNumber(), profile.getGstNumber(),
				profile.getShopPhotoUrl(), profile.getLicenseDocumentUrl(), profile.getOwnerIdProofUrl(),
				profile.getCafeLogoUrl(), profile.getCoverImageUrl(), galleryImages, profile.getAccountHolderName(),
				profile.getAccountNumber(), profile.getIfscCode(), profile.getUpiId(), profile.isAcceptCash(),
				profile.isHasHomeDelivery(), profile.isHasTakeaway(), profile.isHasDineIn(), profile.isCafeVisible(),
				profile.isOrdersPaused(), profile.getMinOrderValue(), profile.getPrepTimeMinutes(),
				profile.getRegistrationDate(), profile.getStatus(), profile.getVerificationStatus(),
				profile.getRejectionReason());
	}

	public static String toCsv(List<String> values) {
		if (values == null || values.isEmpty()) {
			return "";
		}
		return values.stream().map(CafeOwnerMapper::normalizeToken).filter(token -> !token.isBlank()).distinct()
				.collect(Collectors.joining(","));
	}

	public static boolean isOpenNow(CafeOwnerProfile profile) {
		if (profile == null) {
			return false;
		}
		List<String> workingDays = splitCsv(profile.getWorkingDays(), true);
		return isOpenNow(profile.getOpeningTime(), profile.getClosingTime(), workingDays);
	}

	private static List<String> splitCsv(String raw, boolean normalize) {
		if (raw == null || raw.isBlank()) {
			return List.of();
		}
		String[] tokens = raw.split(",");
		List<String> values = new ArrayList<>();
		for (String token : tokens) {
			String value = normalize ? normalizeToken(token) : token.trim();
			if (!value.isBlank()) {
				values.add(value);
			}
		}
		return values;
	}

	private static String normalizeToken(String value) {
		if (value == null) {
			return "";
		}
		return value.trim().toUpperCase(Locale.ENGLISH);
	}

	private static boolean isOpenNow(LocalTime openingTime, LocalTime closingTime, List<String> workingDays) {
		if (openingTime == null || closingTime == null) {
			return false;
		}
		if (workingDays == null || workingDays.isEmpty()) {
			return false;
		}
		DayOfWeek today = LocalDate.now().getDayOfWeek();
		if (!toDaySet(workingDays).contains(today)) {
			return false;
		}
		LocalTime now = LocalTime.now();
		if (openingTime.equals(closingTime)) {
			return true;
		}
		if (openingTime.isBefore(closingTime)) {
			return !now.isBefore(openingTime) && !now.isAfter(closingTime);
		}
		return !now.isBefore(openingTime) || !now.isAfter(closingTime);
	}

	private static Set<DayOfWeek> toDaySet(List<String> workingDays) {
		Set<DayOfWeek> days = EnumSet.noneOf(DayOfWeek.class);
		for (String token : workingDays) {
			DayOfWeek day = parseDay(token);
			if (day != null) {
				days.add(day);
			}
		}
		return days;
	}

	private static DayOfWeek parseDay(String token) {
		if (token == null || token.isBlank()) {
			return null;
		}
		String normalized = normalizeToken(token);
		if (normalized.length() >= 3) {
			normalized = normalized.substring(0, 3);
		}
		return switch (normalized) {
		case "MON" -> DayOfWeek.MONDAY;
		case "TUE" -> DayOfWeek.TUESDAY;
		case "WED" -> DayOfWeek.WEDNESDAY;
		case "THU" -> DayOfWeek.THURSDAY;
		case "FRI" -> DayOfWeek.FRIDAY;
		case "SAT" -> DayOfWeek.SATURDAY;
		case "SUN" -> DayOfWeek.SUNDAY;
		default -> null;
		};
	}
}
