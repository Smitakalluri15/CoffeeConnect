package com.coffee.cafeowner;

import com.coffee.menu.MenuCategoryResponse;
import java.util.List;

public interface CafeCatalogService {
	List<CafePublicResponse> listActiveCafes();

	List<CafePublicResponse> listNearbyCafes(double latitude, double longitude, Double radiusKm, Integer limit);

	CafeDetailsResponse getCafeDetails(Long cafeId);

	List<MenuCategoryResponse> getPublicMenu(Long cafeId);
}
