package com.coffee.staff;

import com.coffee.cafeowner.CafeOwnerProfile;
import com.coffee.user.Role;
import java.util.List;
import java.util.Optional;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;

public interface StaffProfileRepository extends JpaRepository<StaffProfile, Long> {
	List<StaffProfile> findByCafeOwnerOrderByCreatedAtDesc(CafeOwnerProfile cafeOwner);

	Optional<StaffProfile> findByIdAndCafeOwner(Long id, CafeOwnerProfile cafeOwner);

	@Query("select s from StaffProfile s where s.cafeOwner = :owner and s.user.role = :role order by s.createdAt desc")
	List<StaffProfile> findByCafeOwnerAndRole(@Param("owner") CafeOwnerProfile owner, @Param("role") Role role);

	Optional<StaffProfile> findByUserId(Long userId);
}
