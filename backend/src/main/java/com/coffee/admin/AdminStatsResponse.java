package com.coffee.admin;

import java.util.Map;

public class AdminStatsResponse {
	private final long totalUsers;
	private final long activeUsers;
	private final long inactiveUsers;
	private final long pendingUsers;
	private final Map<String, Long> roleCounts;
	private final String uptime;

	public AdminStatsResponse(long totalUsers, long activeUsers, long inactiveUsers, long pendingUsers,
			Map<String, Long> roleCounts, String uptime) {
		this.totalUsers = totalUsers;
		this.activeUsers = activeUsers;
		this.inactiveUsers = inactiveUsers;
		this.pendingUsers = pendingUsers;
		this.roleCounts = roleCounts;
		this.uptime = uptime;
	}

	public long getTotalUsers() {
		return totalUsers;
	}

	public long getActiveUsers() {
		return activeUsers;
	}

	public long getInactiveUsers() {
		return inactiveUsers;
	}

	public long getPendingUsers() {
		return pendingUsers;
	}

	public Map<String, Long> getRoleCounts() {
		return roleCounts;
	}

	public String getUptime() {
		return uptime;
	}
}
