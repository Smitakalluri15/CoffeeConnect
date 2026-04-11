package com.coffee.booking;

import com.coffee.cafeowner.CafeOwnerProfile;
import com.coffee.user.User;
import java.util.List;
import org.springframework.data.jpa.repository.JpaRepository;

public interface BookingRepository extends JpaRepository<CafeBooking, Long> {
	List<CafeBooking> findByUserOrderByBookingDateAsc(User user);

	List<CafeBooking> findByCafeOwnerOrderByBookingDateAsc(CafeOwnerProfile cafeOwner);
}
