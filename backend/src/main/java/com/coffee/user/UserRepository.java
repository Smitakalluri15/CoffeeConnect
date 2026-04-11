package com.coffee.user;

import java.time.Instant;
import java.util.List;
import java.util.Optional;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;

public interface UserRepository extends JpaRepository<User, Long> {
	Optional<User> findByEmail(String email);

	Optional<User> findByEmailIgnoreCase(String email);

	boolean existsByEmail(String email);

	boolean existsByEmailIgnoreCase(String email);

	long countByActive(boolean active);

	long countByEmailVerified(boolean emailVerified);

	long countByRole(Role role);

	@Query("select count(u) from User u where " + "(case when u.emailVerified = false then 'PENDING' "
			+ "when u.active = false then 'INACTIVE' " + "else 'ACTIVE' end) = :status")
	long countByStatus(@Param("status") String status);

	@Query("select u from User u where " + "(case when u.emailVerified = false then 'PENDING' "
			+ "when u.active = false then 'INACTIVE' " + "else 'ACTIVE' end) = :status")
	List<User> findByStatus(@Param("status") String status);

	long countByCreatedAtBetween(Instant start, Instant end);
}
