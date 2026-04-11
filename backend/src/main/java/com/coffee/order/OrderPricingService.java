package com.coffee.order;

import com.coffee.cafeowner.CafeOwnerProfile;
import com.coffee.cafeowner.CafeOwnerProfileRepository;
import com.coffee.cafeowner.CafeOwnerStatus;
import com.coffee.common.NotFoundException;
import com.coffee.menu.MenuItem;
import com.coffee.menu.MenuItemRepository;
import java.math.BigDecimal;
import java.math.RoundingMode;
import java.util.ArrayList;
import java.util.List;
import org.springframework.stereotype.Service;

@Service
public class OrderPricingService {
	private static final BigDecimal TAX_RATE = new BigDecimal("0.05");

	private final CafeOwnerProfileRepository cafeOwnerRepository;
	private final MenuItemRepository menuItemRepository;

	public OrderPricingService(CafeOwnerProfileRepository cafeOwnerRepository, MenuItemRepository menuItemRepository) {
		this.cafeOwnerRepository = cafeOwnerRepository;
		this.menuItemRepository = menuItemRepository;
	}

	public OrderPricingSummary calculate(Long cafeOwnerId, List<OrderItemRequest> items) {
		CafeOwnerProfile cafe = getAvailableCafe(cafeOwnerId);
		List<PricedOrderItem> pricedItems = mapOrderItems(cafe, items);
		BigDecimal subtotal = sumSubtotal(pricedItems);
		BigDecimal taxAmount = subtotal.multiply(TAX_RATE).setScale(2, RoundingMode.HALF_UP);
		BigDecimal totalAmount = subtotal.add(taxAmount).setScale(2, RoundingMode.HALF_UP);
		return new OrderPricingSummary(cafe, pricedItems, subtotal, taxAmount, totalAmount);
	}

	private CafeOwnerProfile getAvailableCafe(Long cafeOwnerId) {
		CafeOwnerProfile cafe = cafeOwnerRepository.findById(cafeOwnerId)
				.orElseThrow(() -> new NotFoundException("Cafe not found"));
		if (cafe.getStatus() != CafeOwnerStatus.ACTIVE || !cafe.isCafeVisible()) {
			throw new IllegalArgumentException("Cafe is not accepting orders right now");
		}
		return cafe;
	}

	private List<PricedOrderItem> mapOrderItems(CafeOwnerProfile cafe, List<OrderItemRequest> items) {
		List<PricedOrderItem> mapped = new ArrayList<>();
		if (items == null || items.isEmpty()) {
			throw new IllegalArgumentException("Select at least one menu item");
		}
		for (OrderItemRequest requestItem : items) {
			MenuItem menuItem = menuItemRepository.findById(requestItem.getMenuItemId())
					.orElseThrow(() -> new NotFoundException("Menu item not found"));
			validateItemBelongsToCafe(cafe, menuItem);
			int quantity = requestItem.getQuantity() == null ? 0 : requestItem.getQuantity();
			BigDecimal unitPrice = menuItem.getPrice().setScale(2, RoundingMode.HALF_UP);
			BigDecimal lineTotal = unitPrice.multiply(BigDecimal.valueOf(quantity)).setScale(2, RoundingMode.HALF_UP);
			mapped.add(new PricedOrderItem(menuItem, quantity, unitPrice, lineTotal));
		}
		return mapped;
	}

	private BigDecimal sumSubtotal(List<PricedOrderItem> items) {
		return items.stream().map(PricedOrderItem::lineTotal).reduce(BigDecimal.ZERO, BigDecimal::add).setScale(2,
				RoundingMode.HALF_UP);
	}

	private void validateItemBelongsToCafe(CafeOwnerProfile cafe, MenuItem item) {
		if (!item.isAvailable()) {
			throw new IllegalArgumentException("One of the selected items is unavailable");
		}
		Long itemCafeId = item.getCategory().getCafeOwner().getId();
		if (!itemCafeId.equals(cafe.getId())) {
			throw new IllegalArgumentException("Menu item does not belong to selected cafe");
		}
	}
}
