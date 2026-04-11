package com.coffee.staff;

import com.coffee.booking.BookingResponse;
import com.coffee.menu.MenuCategoryRequest;
import com.coffee.menu.MenuCategoryResponse;
import com.coffee.menu.MenuItemRequest;
import com.coffee.menu.MenuItemResponse;
import com.coffee.order.OrderStatus;
import com.coffee.user.Role;
import java.util.List;
import org.springframework.web.multipart.MultipartFile;

public interface StaffService {
	StaffResponse createChef(String ownerEmail, ChefCreateRequest request);

	StaffResponse createWaiter(String ownerEmail, WaiterCreateRequest request);

	List<StaffResponse> listByOwner(String ownerEmail, Role roleFilter);

	StaffResponse update(String ownerEmail, Long staffId, StaffUpdateRequest request);

	StaffResponse updateStatus(String ownerEmail, Long staffId, StaffStatus status);

	void delete(String ownerEmail, Long staffId);

	String uploadPhoto(String ownerEmail, MultipartFile file);

	StaffResponse getMyProfile(String loginId);

	StaffDashboardResponse getMyDashboard(String loginId);

	List<MenuCategoryResponse> getChefMenuCategories(String loginId);

	MenuCategoryResponse createChefMenuCategory(String loginId, MenuCategoryRequest request);

	MenuItemResponse addChefMenuItem(String loginId, Long categoryId, MenuItemRequest request);

	MenuItemResponse updateChefMenuItem(String loginId, Long itemId, MenuItemRequest request);

	MenuItemResponse updateChefMenuItemAvailability(String loginId, Long itemId, boolean available);

	StaffKitchenOrderResponse updateKitchenOrderStatus(String loginId, Long orderId, OrderStatus status);

	StaffServiceOrderResponse handleWaiterOrderAction(String loginId, Long orderId, StaffOrderAction action);

	BookingResponse updateWaiterBooking(String loginId, Long bookingId, StaffBookingUpdateRequest request);
}
