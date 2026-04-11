package com.coffee.staff;

import java.util.List;

public class StaffDashboardResponse {
	private final StaffResponse profile;
	private final String cafeName;
	private final String cafeCity;
	private final StaffTableSummaryResponse tableSummary;
	private final List<StaffKitchenOrderResponse> kitchenOrders;
	private final List<StaffKitchenOrderResponse> completedKitchenOrders;
	private final List<StaffServiceOrderResponse> serviceOrders;
	private final List<StaffServiceOrderResponse> completedServiceOrders;
	private final List<StaffBookingQueueResponse> bookings;

	public StaffDashboardResponse(StaffResponse profile, String cafeName, String cafeCity,
			StaffTableSummaryResponse tableSummary, List<StaffKitchenOrderResponse> kitchenOrders,
			List<StaffKitchenOrderResponse> completedKitchenOrders, List<StaffServiceOrderResponse> serviceOrders,
			List<StaffServiceOrderResponse> completedServiceOrders, List<StaffBookingQueueResponse> bookings) {
		this.profile = profile;
		this.cafeName = cafeName;
		this.cafeCity = cafeCity;
		this.tableSummary = tableSummary;
		this.kitchenOrders = kitchenOrders;
		this.completedKitchenOrders = completedKitchenOrders;
		this.serviceOrders = serviceOrders;
		this.completedServiceOrders = completedServiceOrders;
		this.bookings = bookings;
	}

	public StaffResponse getProfile() {
		return profile;
	}

	public String getCafeName() {
		return cafeName;
	}

	public String getCafeCity() {
		return cafeCity;
	}

	public StaffTableSummaryResponse getTableSummary() {
		return tableSummary;
	}

	public List<StaffKitchenOrderResponse> getKitchenOrders() {
		return kitchenOrders;
	}

	public List<StaffKitchenOrderResponse> getCompletedKitchenOrders() {
		return completedKitchenOrders;
	}

	public List<StaffServiceOrderResponse> getServiceOrders() {
		return serviceOrders;
	}

	public List<StaffServiceOrderResponse> getCompletedServiceOrders() {
		return completedServiceOrders;
	}

	public List<StaffBookingQueueResponse> getBookings() {
		return bookings;
	}
}
