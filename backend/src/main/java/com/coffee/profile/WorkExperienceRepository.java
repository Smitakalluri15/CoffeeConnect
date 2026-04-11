package com.coffee.profile;

import java.util.List;
import org.springframework.data.jpa.repository.JpaRepository;

public interface WorkExperienceRepository extends JpaRepository<WorkExperience, Long> {
	List<WorkExperience> findByProfileId(Long profileId);

	boolean existsByProfileId(Long profileId);
}
