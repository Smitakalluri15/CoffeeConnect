package com.coffee.profile;

import org.springframework.data.jpa.repository.JpaRepository;

public interface GovtProofRepository extends JpaRepository<GovtProof, Long> {
	boolean existsByProfileId(Long profileId);
}
