package com.coffee.order;

import com.coffee.menu.MenuItem;
import java.math.BigDecimal;

public record PricedOrderItem(MenuItem menuItem, int quantity, BigDecimal unitPrice, BigDecimal lineTotal) {
}
