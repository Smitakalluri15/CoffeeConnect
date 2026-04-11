package com.coffee.staff;

public class StaffTableSummaryResponse {
	private final int totalTables;
	private final int availableTables;
	private final int reservedTables;
	private final int occupiedTables;
	private final int pendingTables;

	public StaffTableSummaryResponse(int totalTables, int availableTables, int reservedTables, int occupiedTables,
			int pendingTables) {
		this.totalTables = totalTables;
		this.availableTables = availableTables;
		this.reservedTables = reservedTables;
		this.occupiedTables = occupiedTables;
		this.pendingTables = pendingTables;
	}

	public int getTotalTables() {
		return totalTables;
	}

	public int getAvailableTables() {
		return availableTables;
	}

	public int getReservedTables() {
		return reservedTables;
	}

	public int getOccupiedTables() {
		return occupiedTables;
	}

	public int getPendingTables() {
		return pendingTables;
	}
}
