package com.coffee.profile;

import java.util.List;
import org.springframework.data.jpa.repository.JpaRepository;

public interface AcademicInfoRepository extends JpaRepository<AcademicInfo, Long> {
	List<AcademicInfo> findByProfileId(Long profileId);

	boolean existsByProfileId(Long profileId);
}
