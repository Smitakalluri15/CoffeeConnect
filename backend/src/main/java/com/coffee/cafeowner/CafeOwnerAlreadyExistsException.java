package com.coffee.cafeowner;

public class CafeOwnerAlreadyExistsException extends RuntimeException {
	public CafeOwnerAlreadyExistsException(String message) {
		super(message);
	}
}
