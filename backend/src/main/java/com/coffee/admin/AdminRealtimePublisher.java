package com.coffee.admin;

import com.coffee.user.UserResponse;
import java.util.List;
import org.springframework.messaging.simp.SimpMessagingTemplate;
import org.springframework.scheduling.annotation.Scheduled;
import org.springframework.stereotype.Service;

@Service
public class AdminRealtimePublisher {
	private final AdminService adminService;
	private final SimpMessagingTemplate messagingTemplate;

	public AdminRealtimePublisher(AdminService adminService, SimpMessagingTemplate messagingTemplate) {
		this.adminService = adminService;
		this.messagingTemplate = messagingTemplate;
	}

	@Scheduled(fixedDelayString = "${app.admin.stream-interval-ms:5000}")
	public void publishSnapshot() {
		AdminStatsResponse stats = adminService.getStats();
		List<UserResponse> owners = adminService.listOwners();

		messagingTemplate.convertAndSend("/topic/admin/stats", stats);
		messagingTemplate.convertAndSend("/topic/admin/owners", owners);
	}
}
