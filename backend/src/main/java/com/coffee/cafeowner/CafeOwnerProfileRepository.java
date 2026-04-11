package com.coffee.cafeowner;

import java.util.List;
import java.util.Optional;
import org.springframework.data.jpa.repository.JpaRepository;

public interface CafeOwnerProfileRepository extends JpaRepository<CafeOwnerProfile, Long> {
	List<CafeOwnerProfile> findByStatus(CafeOwnerStatus status);

	List<CafeOwnerProfile> findByStatusAndCafeVisibleTrue(CafeOwnerStatus status);

	Optional<CafeOwnerProfile> findByEmail(String email);

	boolean existsByEmail(String email);
}
