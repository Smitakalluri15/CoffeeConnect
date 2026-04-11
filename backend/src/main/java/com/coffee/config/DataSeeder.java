package com.coffee.config;

import com.coffee.booking.BookingRepository;
import com.coffee.booking.BookingStatus;
import com.coffee.booking.CafeBooking;
import com.coffee.cafeowner.CafeOwnerProfile;
import com.coffee.cafeowner.CafeOwnerProfileRepository;
import com.coffee.cafeowner.CafeOwnerStatus;
import com.coffee.cafeowner.CafeType;
import com.coffee.cafeowner.VerificationStatus;
import com.coffee.menu.MenuCategory;
import com.coffee.menu.MenuCategoryRepository;
import com.coffee.menu.MenuItem;
import com.coffee.menu.MenuItemRepository;
import com.coffee.order.CafeOrder;
import com.coffee.order.CafeOrderItem;
import com.coffee.order.CafeOrderRepository;
import com.coffee.order.OrderStatus;
import com.coffee.order.PaymentMethod;
import com.coffee.profile.AcademicInfo;
import com.coffee.profile.AcademicInfoRepository;
import com.coffee.profile.GovtProof;
import com.coffee.profile.GovtProofRepository;
import com.coffee.profile.Profile;
import com.coffee.profile.ProfileRepository;
import com.coffee.profile.WorkExperience;
import com.coffee.profile.WorkExperienceRepository;
import com.coffee.staff.StaffProfile;
import com.coffee.staff.StaffProfileRepository;
import com.coffee.staff.StaffShift;
import com.coffee.staff.StaffStatus;
import com.coffee.user.Role;
import com.coffee.user.User;
import com.coffee.user.UserRepository;
import java.io.IOException;
import java.math.BigDecimal;
import java.math.RoundingMode;
import java.nio.charset.StandardCharsets;
import java.nio.file.Files;
import java.nio.file.Path;
import java.nio.file.Paths;
import java.time.Instant;
import java.time.LocalDate;
import java.time.LocalTime;
import java.util.ArrayList;
import java.util.List;
import java.util.stream.Stream;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.boot.CommandLineRunner;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Component;
import org.springframework.transaction.annotation.Transactional;

@Component
public class DataSeeder implements CommandLineRunner {
	private static final Logger log = LoggerFactory.getLogger(DataSeeder.class);
	private static final List<String> DEFAULT_CAFE_IMAGES = List.of(
			"/uploads/menu/menu_21f254ae-6cbe-49ed-9e4c-10ca234df95f.jpeg",
			"/uploads/menu/menu_c72ba9d2-58d9-4756-ac28-af2d34287ca3.jpeg");

	private final UserRepository userRepository;
	private final ProfileRepository profileRepository;
	private final AcademicInfoRepository academicInfoRepository;
	private final WorkExperienceRepository workExperienceRepository;
	private final GovtProofRepository govtProofRepository;
	private final CafeOwnerProfileRepository cafeOwnerProfileRepository;
	private final StaffProfileRepository staffProfileRepository;
	private final MenuCategoryRepository menuCategoryRepository;
	private final MenuItemRepository menuItemRepository;
	private final BookingRepository bookingRepository;
	private final CafeOrderRepository cafeOrderRepository;
	private final PasswordEncoder passwordEncoder;
	private final String adminEmail;
	private final String adminPassword;
	private final String userEmail;
	private final String userPassword;
	private final String ownerEmail;
	private final String ownerPassword;
	private final String chefLogin;
	private final String chefPassword;
	private final String waiterLogin;
	private final String waiterPassword;
	private final String uploadBaseDir;
	private List<String> cafeImagePool;

	public DataSeeder(UserRepository userRepository, ProfileRepository profileRepository,
			AcademicInfoRepository academicInfoRepository, WorkExperienceRepository workExperienceRepository,
			GovtProofRepository govtProofRepository, CafeOwnerProfileRepository cafeOwnerProfileRepository,
			StaffProfileRepository staffProfileRepository, MenuCategoryRepository menuCategoryRepository,
			MenuItemRepository menuItemRepository, BookingRepository bookingRepository,
			CafeOrderRepository cafeOrderRepository, PasswordEncoder passwordEncoder,
			@Value("${app.admin.email}") String adminEmail, @Value("${app.admin.password}") String adminPassword,
			@Value("${app.user.email}") String userEmail, @Value("${app.user.password}") String userPassword,
			@Value("${app.owner.email}") String ownerEmail, @Value("${app.owner.password}") String ownerPassword,
			@Value("${app.chef.login:chef01}") String chefLogin,
			@Value("${app.chef.password:chef12345}") String chefPassword,
			@Value("${app.waiter.login:waiter01}") String waiterLogin,
			@Value("${app.waiter.password:waiter12345}") String waiterPassword,
			@Value("${app.upload.base-dir:uploads}") String uploadBaseDir) {
		this.userRepository = userRepository;
		this.profileRepository = profileRepository;
		this.academicInfoRepository = academicInfoRepository;
		this.workExperienceRepository = workExperienceRepository;
		this.govtProofRepository = govtProofRepository;
		this.cafeOwnerProfileRepository = cafeOwnerProfileRepository;
		this.staffProfileRepository = staffProfileRepository;
		this.menuCategoryRepository = menuCategoryRepository;
		this.menuItemRepository = menuItemRepository;
		this.bookingRepository = bookingRepository;
		this.cafeOrderRepository = cafeOrderRepository;
		this.passwordEncoder = passwordEncoder;
		this.adminEmail = adminEmail;
		this.adminPassword = adminPassword;
		this.userEmail = userEmail;
		this.userPassword = userPassword;
		this.ownerEmail = ownerEmail;
		this.ownerPassword = ownerPassword;
		this.chefLogin = chefLogin;
		this.chefPassword = chefPassword;
		this.waiterLogin = waiterLogin;
		this.waiterPassword = waiterPassword;
		this.uploadBaseDir = uploadBaseDir;
		this.cafeImagePool = new ArrayList<>(DEFAULT_CAFE_IMAGES);
	}

	@Override
	@Transactional
	public void run(String... args) {
		initializeCafeImagePool();
		seedAdmin();
		seedUser();
		seedOwner();
		seedCatalogCafes();
		seedStaff();
		seedStaffOperationalData();
	}

	private void seedAdmin() {
		if (adminEmail == null || adminEmail.isBlank()) {
			return;
		}
		String normalized = adminEmail.toLowerCase();
		if (userRepository.existsByEmail(normalized)) {
			return;
		}
		User admin = new User();
		admin.setEmail(normalized);
		admin.setPasswordHash(passwordEncoder.encode(adminPassword));
		admin.setRole(Role.ADMIN);
		admin.setActive(true);
		admin.setEmailVerified(true);
		admin.setMustResetPassword(false);
		userRepository.save(admin);
		log.info("Default admin created: {}", adminEmail);
	}

	private void seedUser() {
		if (userEmail == null || userEmail.isBlank()) {
			return;
		}
		String normalized = userEmail.toLowerCase();
		User existing = userRepository.findByEmail(normalized).orElse(null);
		if (existing != null) {
			ensureProfile(existing);
			return;
		}

		User user = new User();
		user.setEmail(normalized);
		user.setPasswordHash(passwordEncoder.encode(userPassword));
		user.setRole(Role.USER);
		user.setActive(true);
		user.setEmailVerified(true);
		user.setMustResetPassword(false);
		User saved = userRepository.save(user);
		ensureProfile(saved);
		log.info("Default user created: {}", userEmail);
	}

	private void seedOwner() {
		if (ownerEmail == null || ownerEmail.isBlank()) {
			return;
		}
		String normalized = ownerEmail.toLowerCase();
		User existing = userRepository.findByEmail(normalized).orElse(null);
		if (existing != null) {
			ensureOwnerProfile(normalized);
			return;
		}

		User owner = new User();
		owner.setEmail(normalized);
		owner.setPasswordHash(passwordEncoder.encode(ownerPassword));
		owner.setRole(Role.CAFE_OWNER);
		owner.setActive(true);
		owner.setEmailVerified(true);
		owner.setMustResetPassword(false);
		userRepository.save(owner);
		ensureOwnerProfile(normalized);
		log.info("Default cafe owner created: {}", ownerEmail);
	}

	private void ensureOwnerProfile(String email) {
		if (email == null || email.isBlank()) {
			return;
		}
		CafeOwnerProfile existing = cafeOwnerProfileRepository.findByEmail(email).orElse(null);
		if (existing != null) {
			boolean updated = ensureCafeVisibilityAndStatus(existing);
			if (ensureBrandingUrls(existing, 0, true)) {
				updated = true;
			}
			if (updated) {
				cafeOwnerProfileRepository.save(existing);
			}
			return;
		}

		CafeOwnerProfile profile = new CafeOwnerProfile();
		profile.setCafeName("Bean & Brew");
		profile.setBrandName("Bean & Brew Co.");
		profile.setDescription("A cozy cafe with artisan coffee and fresh bakes.");
		profile.setCafeType(CafeType.CAFE);
		profile.setOpeningDate(LocalDate.of(2022, 6, 15));
		profile.setOwnerName("Ravi Kumar");
		profile.setContactNumber("9876543210");
		profile.setEmail(email);
		profile.setPasswordHash(passwordEncoder.encode(ownerPassword));
		profile.setCafeContactNumber("9000011111");
		profile.setCafeEmail("hello@beanbrew.in");
		profile.setWhatsappNumber("9000011111");
		profile.setOpeningTime(LocalTime.of(8, 0));
		profile.setClosingTime(LocalTime.of(22, 0));
		profile.setWorkingDays("MON,TUE,WED,THU,FRI,SAT,SUN");
		profile.setStreet("12 MG Road");
		profile.setLandmark("Near Metro Station");
		profile.setCity("Hyderabad");
		profile.setState("Telangana");
		profile.setPincode("500081");
		profile.setLatitude(17.4375);
		profile.setLongitude(78.4483);
		profile.setFssaiLicenseNumber("FSSAI1234567890");
		profile.setGstNumber("27ABCDE1234F1Z5");
		String primaryImage = defaultCafeImage(0);
		profile.setShopPhotoUrl(primaryImage);
		profile.setLicenseDocumentUrl(primaryImage);
		profile.setOwnerIdProofUrl(primaryImage);
		profile.setCafeLogoUrl(primaryImage);
		profile.setCoverImageUrl(primaryImage);
		profile.setGalleryImages(defaultGalleryImages(0));
		profile.setAccountHolderName("Ravi Kumar");
		profile.setAccountNumber("123456789012");
		profile.setIfscCode("HDFC0001234");
		profile.setUpiId("beanbrew@upi");
		profile.setAcceptCash(true);
		profile.setHasHomeDelivery(true);
		profile.setHasTakeaway(true);
		profile.setHasDineIn(true);
		profile.setCafeVisible(true);
		profile.setOrdersPaused(false);
		profile.setMinOrderValue(new BigDecimal("199.00"));
		profile.setPrepTimeMinutes(15);
		profile.setStatus(CafeOwnerStatus.ACTIVE);
		profile.setVerificationStatus(VerificationStatus.VERIFIED);
		cafeOwnerProfileRepository.save(profile);
	}

	private void seedCatalogCafes() {
		seedCatalogCafe("smilo@coffee.local", "Smilo", "Smilo Bakery",
				"Aesthetic bakery cafe with artisan desserts and espresso.", CafeType.BAKERY, "Hyderabad", "Telangana",
				"45 Jubilee Hills Road", "Near Film Nagar", "500033", LocalTime.of(9, 0), LocalTime.of(23, 0), true,
				true, true, 1);
		seedCatalogCafe("urbanroast@coffee.local", "Urban Roast", "Urban Roast House",
				"Contemporary roastery serving pour-overs, brunch, and quick bites.", CafeType.CAFE, "Bengaluru",
				"Karnataka", "18 Indiranagar 100 Feet Road", "Near Metro Pillar 72", "560038", LocalTime.of(8, 0),
				LocalTime.of(22, 30), true, true, true, 2);
		seedCatalogCafe("coastalcup@coffee.local", "Coastal Cup", "Coastal Cup Cafe",
				"Sea-breeze inspired cafe known for cold brews and fresh bakes.", CafeType.BEVERAGE_BAR,
				"Visakhapatnam", "Andhra Pradesh", "7 Beach Road", "Opposite RK Beach", "530003", LocalTime.of(7, 30),
				LocalTime.of(21, 30), false, true, true, 3);
	}

	private void seedCatalogCafe(String email, String cafeName, String brandName, String description, CafeType cafeType,
			String city, String state, String street, String landmark, String pincode, LocalTime openingTime,
			LocalTime closingTime, boolean hasHomeDelivery, boolean hasTakeaway, boolean hasDineIn, int imageIndex) {
		CafeOwnerProfile existing = cafeOwnerProfileRepository.findByEmail(email).orElse(null);
		if (existing != null) {
			boolean updated = ensureCafeVisibilityAndStatus(existing);
			if (ensureBrandingUrls(existing, imageIndex, true)) {
				updated = true;
			}
			if (updated) {
				cafeOwnerProfileRepository.save(existing);
			}
			return;
		}

		CafeOwnerProfile profile = new CafeOwnerProfile();
		profile.setCafeName(cafeName);
		profile.setBrandName(brandName);
		profile.setDescription(description);
		profile.setCafeType(cafeType);
		profile.setOpeningDate(LocalDate.of(2021, 1, 15));
		profile.setOwnerName(cafeName + " Owner");
		profile.setContactNumber("90000" + (10000 + imageIndex));
		profile.setEmail(email);
		profile.setPasswordHash(passwordEncoder.encode(ownerPassword));
		profile.setCafeContactNumber("90000" + (20000 + imageIndex));
		profile.setCafeEmail("hello@" + email.substring(email.indexOf('@') + 1));
		profile.setWhatsappNumber("90000" + (30000 + imageIndex));
		profile.setOpeningTime(openingTime);
		profile.setClosingTime(closingTime);
		profile.setWorkingDays("MON,TUE,WED,THU,FRI,SAT,SUN");
		profile.setStreet(street);
		profile.setLandmark(landmark);
		profile.setCity(city);
		profile.setState(state);
		profile.setPincode(pincode);
		profile.setLatitude(17.4375 + (imageIndex * 0.01));
		profile.setLongitude(78.4483 + (imageIndex * 0.01));
		profile.setFssaiLicenseNumber("FSSAI" + (2234567800L + imageIndex));
		profile.setGstNumber("29ABCDE12" + (30 + imageIndex) + "F1Z5");
		profile.setAccountHolderName(cafeName + " Pvt Ltd");
		profile.setAccountNumber("1234567890" + imageIndex);
		profile.setIfscCode("HDFC00012" + (10 + imageIndex));
		profile.setUpiId(cafeName.toLowerCase().replaceAll("\\s+", "") + "@upi");
		profile.setAcceptCash(true);
		profile.setHasHomeDelivery(hasHomeDelivery);
		profile.setHasTakeaway(hasTakeaway);
		profile.setHasDineIn(hasDineIn);
		profile.setCafeVisible(true);
		profile.setOrdersPaused(false);
		profile.setMinOrderValue(new BigDecimal("149.00"));
		profile.setPrepTimeMinutes(15);
		profile.setStatus(CafeOwnerStatus.ACTIVE);
		profile.setVerificationStatus(VerificationStatus.VERIFIED);
		ensureBrandingUrls(profile, imageIndex, true);
		cafeOwnerProfileRepository.save(profile);
		log.info("Seed cafe profile created: {}", email);
	}

	private boolean ensureCafeVisibilityAndStatus(CafeOwnerProfile profile) {
		boolean updated = false;
		if (profile.getStatus() != CafeOwnerStatus.ACTIVE) {
			profile.setStatus(CafeOwnerStatus.ACTIVE);
			updated = true;
		}
		if (profile.getVerificationStatus() != VerificationStatus.VERIFIED) {
			profile.setVerificationStatus(VerificationStatus.VERIFIED);
			updated = true;
		}
		if (!profile.isCafeVisible()) {
			profile.setCafeVisible(true);
			updated = true;
		}
		return updated;
	}

	private boolean ensureBrandingUrls(CafeOwnerProfile profile, int imageIndex, boolean force) {
		String image = defaultCafeImage(imageIndex);
		String gallery = defaultGalleryImages(imageIndex);
		boolean updated = false;
		if (force || isMissingOrPlaceholder(profile.getShopPhotoUrl())) {
			profile.setShopPhotoUrl(image);
			updated = true;
		}
		if (force || isMissingOrPlaceholder(profile.getCafeLogoUrl())) {
			profile.setCafeLogoUrl(image);
			updated = true;
		}
		if (force || isMissingOrPlaceholder(profile.getCoverImageUrl())) {
			profile.setCoverImageUrl(image);
			updated = true;
		}
		if (force || isMissingOrPlaceholder(profile.getGalleryImages())) {
			profile.setGalleryImages(gallery);
			updated = true;
		}
		if (force || isMissingOrPlaceholder(profile.getLicenseDocumentUrl())) {
			profile.setLicenseDocumentUrl(image);
			updated = true;
		}
		if (force || isMissingOrPlaceholder(profile.getOwnerIdProofUrl())) {
			profile.setOwnerIdProofUrl(image);
			updated = true;
		}
		return updated;
	}

	private boolean isMissingOrPlaceholder(String url) {
		if (url == null || url.isBlank()) {
			return true;
		}
		return url.contains("example.com");
	}

	private void initializeCafeImagePool() {
		List<String> discovered = discoverCafeImages();
		if (!discovered.isEmpty()) {
			this.cafeImagePool = discovered;
			log.info("Loaded {} cafe image(s) from uploads/cafe for seed mapping.", discovered.size());
			return;
		}
		this.cafeImagePool = new ArrayList<>(DEFAULT_CAFE_IMAGES);
		log.info("No custom cafe images found. Using default seed images.");
	}

	private List<String> discoverCafeImages() {
		List<String> images = new ArrayList<>();
		Path cwd = Paths.get(System.getProperty("user.dir")).toAbsolutePath().normalize();
		Path configured = Paths.get(uploadBaseDir);
		Path uploadRoot = configured.isAbsolute() ? configured.normalize() : cwd.resolve(configured).normalize();
		Path primaryCafeDir = uploadRoot.resolve("cafe");
		Path backendCafeDir = cwd.resolve("backend").resolve(uploadBaseDir).resolve("cafe").normalize();

		for (Path dir : List.of(primaryCafeDir, backendCafeDir).stream().distinct().toList()) {
			images.addAll(readImagePaths(dir));
		}
		return images.stream().distinct().toList();
	}

	private List<String> readImagePaths(Path dir) {
		if (!Files.isDirectory(dir)) {
			return List.of();
		}
		try (Stream<Path> files = Files.list(dir)) {
			return files.filter(Files::isRegularFile).map(path -> path.getFileName().toString())
					.filter(this::isSupportedImageFile).sorted().map(name -> "/uploads/cafe/" + name).toList();
		} catch (IOException ex) {
			log.warn("Unable to scan cafe image directory {}: {}", dir, ex.getMessage());
			return List.of();
		}
	}

	private boolean isSupportedImageFile(String fileName) {
		String lower = fileName == null ? "" : fileName.toLowerCase();
		return lower.endsWith(".jpg") || lower.endsWith(".jpeg") || lower.endsWith(".png") || lower.endsWith(".webp");
	}

	private String defaultCafeImage(int imageIndex) {
		if (cafeImagePool == null || cafeImagePool.isEmpty()) {
			return DEFAULT_CAFE_IMAGES.get(0);
		}
		int safeIndex = Math.floorMod(imageIndex, cafeImagePool.size());
		return cafeImagePool.get(safeIndex);
	}

	private String defaultGalleryImages(int startIndex) {
		if (cafeImagePool == null || cafeImagePool.isEmpty()) {
			return String.join(",", DEFAULT_CAFE_IMAGES);
		}
		int count = Math.min(3, cafeImagePool.size());
		List<String> selected = new ArrayList<>();
		for (int offset = 0; offset < count; offset++) {
			int idx = Math.floorMod(startIndex + offset, cafeImagePool.size());
			selected.add(cafeImagePool.get(idx));
		}
		return String.join(",", selected);
	}

	private void seedStaff() {
		CafeOwnerProfile owner = findOwnerForStaffSeed();
		if (owner == null) {
			return;
		}
		seedChef(owner);
		seedWaiter(owner);
	}

	private void seedStaffOperationalData() {
		CafeOwnerProfile owner = findOwnerForStaffSeed();
		User customer = findCustomerForOperationalSeed();
		if (owner == null || customer == null) {
			return;
		}
		List<MenuItem> menuItems = ensureOperationalMenu(owner);
		if (menuItems.size() < 4) {
			log.warn("Skipping staff operational seed because the owner cafe menu is incomplete.");
			return;
		}
		seedOperationalBookings(owner, customer);
		seedOperationalOrders(owner, customer, menuItems);
	}

	private CafeOwnerProfile findOwnerForStaffSeed() {
		if (ownerEmail == null || ownerEmail.isBlank()) {
			return null;
		}
		return cafeOwnerProfileRepository.findByEmail(ownerEmail.trim().toLowerCase()).orElse(null);
	}

	private User findCustomerForOperationalSeed() {
		if (userEmail != null && !userEmail.isBlank()) {
			User seeded = userRepository.findByEmailIgnoreCase(userEmail.trim().toLowerCase()).orElse(null);
			if (seeded != null) {
				return seeded;
			}
		}
		return userRepository.findAll().stream().filter(user -> user.getRole() == Role.USER).findFirst().orElse(null);
	}

	private void seedChef(CafeOwnerProfile owner) {
		User user = createOrActivateStaffUser(chefLogin, chefPassword, Role.CHEF);
		if (user == null) {
			return;
		}
		StaffProfile chef = staffProfileRepository.findByUserId(user.getId()).orElseGet(StaffProfile::new);
		chef.setCafeOwner(owner);
		chef.setUser(user);
		chef.setFullName("Arjun Chef");
		chef.setPhoneNumber("9876501111");
		chef.setEmail("arjun.chef@coffee.local");
		chef.setGender("Male");
		chef.setProfilePhotoUrl(null);
		chef.setStatus(StaffStatus.ACTIVE);
		chef.setShift(StaffShift.MORNING);
		chef.setExperience("Intermediate");
		chef.setSpecialization("Coffee");
		chef.setSectionArea(null);
		staffProfileRepository.save(chef);
		log.info("Default chef ready: {}", user.getEmail());
	}

	private void seedWaiter(CafeOwnerProfile owner) {
		User user = createOrActivateStaffUser(waiterLogin, waiterPassword, Role.WAITER);
		if (user == null) {
			return;
		}
		StaffProfile waiter = staffProfileRepository.findByUserId(user.getId()).orElseGet(StaffProfile::new);
		waiter.setCafeOwner(owner);
		waiter.setUser(user);
		waiter.setFullName("Kiran Waiter");
		waiter.setPhoneNumber("9876502222");
		waiter.setEmail("kiran.waiter@coffee.local");
		waiter.setGender(null);
		waiter.setProfilePhotoUrl(null);
		waiter.setStatus(StaffStatus.ACTIVE);
		waiter.setShift(StaffShift.EVENING);
		waiter.setExperience(null);
		waiter.setSpecialization(null);
		waiter.setSectionArea("Tables A1-A6");
		staffProfileRepository.save(waiter);
		log.info("Default waiter ready: {}", user.getEmail());
	}

	private List<MenuItem> ensureOperationalMenu(CafeOwnerProfile owner) {
		List<MenuCategory> categories = new ArrayList<>(menuCategoryRepository.findByCafeOwner(owner));
		MenuCategory coffee = findOrCreateCategory(owner, categories, "Coffee", "Core espresso and milk beverages.");
		MenuCategory snacks = findOrCreateCategory(owner, categories, "Snacks", "Fast-moving dine-in favorites.");

		List<MenuItem> menuItems = new ArrayList<>();
		menuItems.add(findOrCreateMenuItem(coffee, "House Cappuccino", "Signature espresso with steamed milk and foam.",
				"160.00", true, 0));
		menuItems.add(findOrCreateMenuItem(coffee, "Hazelnut Latte", "Hazelnut latte finished with silky milk.",
				"190.00", true, 1));
		menuItems.add(findOrCreateMenuItem(snacks, "Paneer Toastie", "Grilled paneer toastie with herb mayo.", "220.00",
				true, 0));
		menuItems.add(findOrCreateMenuItem(snacks, "Chocolate Muffin",
				"Soft baked muffin with molten chocolate center.", "130.00", true, 1));
		return menuItems;
	}

	private MenuCategory findOrCreateCategory(CafeOwnerProfile owner, List<MenuCategory> existingCategories,
			String name, String description) {
		for (MenuCategory category : existingCategories) {
			if (category.getName() != null && category.getName().equalsIgnoreCase(name)) {
				if (!category.isActive()) {
					category.setActive(true);
				}
				if (category.getDescription() == null || category.getDescription().isBlank()) {
					category.setDescription(description);
				}
				return menuCategoryRepository.save(category);
			}
		}
		MenuCategory category = new MenuCategory();
		category.setCafeOwner(owner);
		category.setName(name);
		category.setDescription(description);
		category.setActive(true);
		MenuCategory saved = menuCategoryRepository.save(category);
		existingCategories.add(saved);
		return saved;
	}

	private MenuItem findOrCreateMenuItem(MenuCategory category, String name, String description, String price,
			boolean veg, int imageIndex) {
		return menuItemRepository.findByCategory(category).stream()
				.filter(item -> item.getName() != null && item.getName().equalsIgnoreCase(name)).findFirst()
				.map(existing -> updateSeedMenuItem(existing, description, price, veg, imageIndex))
				.orElseGet(() -> createSeedMenuItem(category, name, description, price, veg, imageIndex));
	}

	private MenuItem updateSeedMenuItem(MenuItem item, String description, String price, boolean veg, int imageIndex) {
		item.setDescription(description);
		item.setPrice(new BigDecimal(price));
		item.setVeg(veg);
		item.setAvailable(true);
		if (item.getImageUrl() == null || item.getImageUrl().isBlank()) {
			item.setImageUrl(defaultCafeImage(imageIndex));
		}
		return menuItemRepository.save(item);
	}

	private MenuItem createSeedMenuItem(MenuCategory category, String name, String description, String price,
			boolean veg, int imageIndex) {
		MenuItem item = new MenuItem();
		item.setCategory(category);
		item.setName(name);
		item.setDescription(description);
		item.setPrice(new BigDecimal(price));
		item.setVeg(veg);
		item.setAvailable(true);
		item.setImageUrl(defaultCafeImage(imageIndex));
		return menuItemRepository.save(item);
	}

	private void seedOperationalBookings(CafeOwnerProfile owner, User customer) {
		LocalDate today = LocalDate.now();
		createSeedBookingIfMissing(owner, customer, today, "01:00 PM", 2, "Window Table (2-Seater)",
				"Anniversary coffee catch-up", null, BookingStatus.NEW);
		createSeedBookingIfMissing(owner, customer, today, "02:30 PM", 4, "Booth Sofa (4-Seater)", "Team meetup", "T4",
				BookingStatus.CONFIRMED);
		createSeedBookingIfMissing(owner, customer, today, "04:00 PM", 3, "Indoor Family (4-Seater)",
				"Birthday celebration", "T6", BookingStatus.SEATED);
	}

	private void createSeedBookingIfMissing(CafeOwnerProfile owner, User customer, LocalDate bookingDate,
			String timeSlot, int partySize, String seatingPreference, String notes, String assignedTable,
			BookingStatus status) {
		boolean exists = bookingRepository.findByCafeOwnerOrderByBookingDateAsc(owner).stream()
				.anyMatch(booking -> booking.getUser().getId().equals(customer.getId())
						&& bookingDate.equals(booking.getBookingDate())
						&& timeSlot.equalsIgnoreCase(booking.getTimeSlot()) && partySize == booking.getPartySize());
		if (exists) {
			return;
		}
		CafeBooking booking = new CafeBooking();
		booking.setUser(customer);
		booking.setCafeOwner(owner);
		booking.setBookingDate(bookingDate);
		booking.setTimeSlot(timeSlot);
		booking.setPartySize(partySize);
		booking.setSeatingPreference(seatingPreference);
		booking.setNotes(notes);
		booking.setAssignedTable(assignedTable);
		booking.setStatus(status);
		bookingRepository.save(booking);
	}

	private void seedOperationalOrders(CafeOwnerProfile owner, User customer, List<MenuItem> menuItems) {
		MenuItem cappuccino = findMenuItem(menuItems, "House Cappuccino");
		MenuItem latte = findMenuItem(menuItems, "Hazelnut Latte");
		MenuItem toastie = findMenuItem(menuItems, "Paneer Toastie");
		MenuItem muffin = findMenuItem(menuItems, "Chocolate Muffin");
		createSeedOrderIfMissing(owner, customer, "seed-chef-new@coffee.local", "Nisha", "9876503101", "T2",
				OrderStatus.CONFIRMED, PaymentMethod.PAY_AT_CAFE, false, false, false, false,
				"Less sugar in both drinks", List.of(cappuccino, latte), List.of(1, 1));
		createSeedOrderIfMissing(owner, customer, "seed-chef-preparing@coffee.local", "Rahul", "9876503102", "T4",
				OrderStatus.PREPARING, PaymentMethod.PAY_AT_CAFE, false, false, false, false, "Toastie without onion",
				List.of(toastie, cappuccino), List.of(1, 2));
		createSeedOrderIfMissing(owner, customer, "seed-waiter-ready@coffee.local", "Meera", "9876503103", "T6",
				OrderStatus.READY, PaymentMethod.PAY_AT_CAFE, false, false, false, false, "Serve together",
				List.of(latte, muffin), List.of(2, 1));
		createSeedOrderIfMissing(owner, customer, "seed-waiter-billed@coffee.local", "Arun", "9876503104", "T8",
				OrderStatus.READY, PaymentMethod.PAY_AT_CAFE, true, true, false, false, "Birthday table order",
				List.of(toastie, muffin, cappuccino), List.of(1, 2, 2));
	}

	private MenuItem findMenuItem(List<MenuItem> items, String name) {
		return items.stream().filter(item -> item.getName() != null && item.getName().equalsIgnoreCase(name))
				.findFirst().orElseThrow(() -> new IllegalStateException("Required seed menu item missing: " + name));
	}

	private void createSeedOrderIfMissing(CafeOwnerProfile owner, User customer, String customerEmail,
			String customerName, String customerPhone, String tableNumber, OrderStatus status,
			PaymentMethod paymentMethod, boolean served, boolean billGenerated, boolean paymentInitiated, boolean paid,
			String notes, List<MenuItem> items, List<Integer> quantities) {
		boolean exists = cafeOrderRepository.findByCafeOwnerOrderByCreatedAtAsc(owner).stream()
				.anyMatch(order -> customerEmail.equalsIgnoreCase(order.getCustomerEmail()));
		if (exists) {
			return;
		}

		CafeOrder order = new CafeOrder();
		order.setUser(customer);
		order.setCafeOwner(owner);
		order.setStatus(status);
		order.setPaymentMethod(paymentMethod);
		order.setTableNumber(tableNumber);
		order.setCustomerName(customerName);
		order.setCustomerPhone(customerPhone);
		order.setCustomerEmail(customerEmail);
		order.setAddressLine("Bean & Brew, MG Road");
		order.setLandmark("Main service counter");
		order.setDeliveryNotes(notes);
		order.setPaymentProvider(paymentMethod == PaymentMethod.ONLINE ? "RAZORPAY" : "PAY_AT_CAFE");

		BigDecimal subtotal = BigDecimal.ZERO;
		for (int index = 0; index < items.size(); index++) {
			MenuItem menuItem = items.get(index);
			int quantity = quantities.get(index);
			BigDecimal lineTotal = menuItem.getPrice().multiply(BigDecimal.valueOf(quantity));
			CafeOrderItem orderItem = new CafeOrderItem();
			orderItem.setOrder(order);
			orderItem.setMenuItem(menuItem);
			orderItem.setItemName(menuItem.getName());
			orderItem.setQuantity(quantity);
			orderItem.setUnitPrice(menuItem.getPrice());
			orderItem.setLineTotal(lineTotal);
			order.getItems().add(orderItem);
			subtotal = subtotal.add(lineTotal);
		}

		BigDecimal taxAmount = subtotal.multiply(new BigDecimal("0.05")).setScale(2, RoundingMode.HALF_UP);
		order.setSubtotal(subtotal.setScale(2, RoundingMode.HALF_UP));
		order.setTaxAmount(taxAmount);
		order.setTotalAmount(subtotal.add(taxAmount).setScale(2, RoundingMode.HALF_UP));

		Instant now = Instant.now();
		if (served) {
			order.setServedAt(now);
		}
		if (billGenerated) {
			order.setBillGeneratedAt(now);
		}
		if (paymentInitiated) {
			order.setPaymentInitiatedAt(now);
		}
		if (paid) {
			order.setPaidAt(now);
			order.setPaymentVerified(true);
		}

		cafeOrderRepository.save(order);
	}

	private User createOrActivateStaffUser(String loginId, String rawPassword, Role role) {
		if (loginId == null || loginId.isBlank() || rawPassword == null || rawPassword.isBlank()) {
			return null;
		}
		String normalized = loginId.trim().toLowerCase();
		User existing = userRepository.findByEmailIgnoreCase(normalized).orElse(null);
		if (existing != null) {
			if (existing.getRole() != role) {
				log.warn("Skipping staff seed for {} because role is {}", normalized, existing.getRole());
				return null;
			}
			existing.setActive(true);
			existing.setEmailVerified(true);
			existing.setMustResetPassword(false);
			existing.setPasswordHash(passwordEncoder.encode(rawPassword));
			return existing;
		}

		User user = new User();
		user.setEmail(normalized);
		user.setPasswordHash(passwordEncoder.encode(rawPassword));
		user.setRole(role);
		user.setActive(true);
		user.setEmailVerified(true);
		user.setMustResetPassword(false);
		return userRepository.save(user);
	}

	private void ensureProfile(User user) {
		if (user == null) {
			return;
		}
		Profile profile = profileRepository.findByUserId(user.getId()).orElse(null);
		if (profile != null && isProfilePopulated(profile)) {
			return;
		}
		if (profile == null) {
			profile = new Profile();
			profile.setUser(user);
		}

		profile.setFirstName("Aarav");
		profile.setLastName("Mehta");
		profile.setDob(LocalDate.of(2001, 5, 12));
		profile.setGender("Male");
		profile.setContactNo("9876543210");
		profile.setMaritalStatus("Single");
		profile.setStreet("12B, Sunrise Apartments");
		profile.setPlotNo("Near Lakeview Park");
		profile.setCity("Hyderabad");
		profile.setState("Telangana");
		profile.setPincode("500081");
		profile.setCountry("India");

		profile.getAcademicInfos().clear();
		AcademicInfo academic = new AcademicInfo();
		academic.setProfile(profile);
		academic.setInstitution("Anurag University");
		academic.setDegree("B.Tech");
		academic.setFieldOfStudy("Computer Science");
		academic.setStartYear(2019);
		academic.setEndYear(2023);
		profile.getAcademicInfos().add(academic);

		profile.getWorkExperiences().clear();
		WorkExperience work = new WorkExperience();
		work.setProfile(profile);
		work.setCompany("Cafe Aroma");
		work.setTitle("Barista Intern");
		work.setStartDate(LocalDate.of(2023, 6, 1));
		work.setEndDate(LocalDate.of(2023, 12, 15));
		work.setDescription("Handled espresso prep and customer service.");
		profile.getWorkExperiences().add(work);

		GovtProof proof = new GovtProof();
		proof.setProfile(profile);
		proof.setIdType("Aadhaar");
		proof.setIdNumber("1234-5678-9012");
		proof.setFileName("aadhaar.txt");
		proof.setFileType("text/plain");
		proof.setFileData("SEED_ID_PROOF".getBytes(StandardCharsets.UTF_8));
		profile.setGovtProof(proof);

		profile.setCompletionPercent(100);
		profileRepository.save(profile);
	}

	private boolean isProfilePopulated(Profile profile) {
		if (profile == null) {
			return false;
		}
		if (profile.getId() == null) {
			return false;
		}
		if (profile.getFirstName() != null && !profile.getFirstName().isBlank()) {
			return true;
		}
		if (academicInfoRepository.existsByProfileId(profile.getId())) {
			return true;
		}
		if (workExperienceRepository.existsByProfileId(profile.getId())) {
			return true;
		}
		return govtProofRepository.existsByProfileId(profile.getId());
	}
}
