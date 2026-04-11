package com.coffee.order;

import com.coffee.cafeowner.CafeOwnerProfile;
import java.math.BigDecimal;
import java.util.List;

public record OrderPricingSummary(CafeOwnerProfile cafeOwner, List<PricedOrderItem> items, BigDecimal subtotal,
		BigDecimal taxAmount, BigDecimal totalAmount) {
}
