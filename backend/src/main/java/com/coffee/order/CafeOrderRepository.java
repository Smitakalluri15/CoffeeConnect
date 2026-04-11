package com.coffee.order;

import com.coffee.cafeowner.CafeOwnerProfile;
import com.coffee.user.User;
import java.util.List;
import java.util.Optional;
import org.springframework.data.jpa.repository.JpaRepository;

public interface CafeOrderRepository extends JpaRepository<CafeOrder, Long> {
	List<CafeOrder> findByUserOrderByCreatedAtDesc(User user);

	Optional<CafeOrder> findByIdAndUser(Long id, User user);

	List<CafeOrder> findByCafeOwnerOrderByCreatedAtAsc(CafeOwnerProfile cafeOwner);

	Optional<CafeOrder> findByIdAndCafeOwner(Long id, CafeOwnerProfile cafeOwner);
}
