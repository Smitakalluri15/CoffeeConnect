package com.coffee.common;

import com.coffee.cafeowner.CafeOwnerAlreadyExistsException;
import com.coffee.cafeowner.CafeOwnerNotFoundException;
import java.time.Instant;
import java.util.Map;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.MethodArgumentNotValidException;
import org.springframework.web.bind.annotation.ExceptionHandler;
import org.springframework.web.bind.annotation.RestControllerAdvice;

@RestControllerAdvice
public class ApiExceptionHandler {
	@ExceptionHandler(IllegalArgumentException.class)
	public ResponseEntity<Map<String, Object>> handleIllegalArgument(IllegalArgumentException ex) {
		return ResponseEntity.badRequest().body(Map.of("timestamp", Instant.now(), "error", ex.getMessage()));
	}

	@ExceptionHandler(NotFoundException.class)
	public ResponseEntity<Map<String, Object>> handleNotFound(NotFoundException ex) {
		return ResponseEntity.status(HttpStatus.NOT_FOUND)
				.body(Map.of("timestamp", Instant.now(), "error", ex.getMessage()));
	}

	@ExceptionHandler(CafeOwnerAlreadyExistsException.class)
	public ResponseEntity<Map<String, Object>> handleCafeOwnerExists(CafeOwnerAlreadyExistsException ex) {
		return ResponseEntity.status(HttpStatus.CONFLICT)
				.body(Map.of("timestamp", Instant.now(), "error", ex.getMessage()));
	}

	@ExceptionHandler(CafeOwnerNotFoundException.class)
	public ResponseEntity<Map<String, Object>> handleCafeOwnerNotFound(CafeOwnerNotFoundException ex) {
		return ResponseEntity.status(HttpStatus.NOT_FOUND)
				.body(Map.of("timestamp", Instant.now(), "error", ex.getMessage()));
	}

	@ExceptionHandler(MethodArgumentNotValidException.class)
	public ResponseEntity<Map<String, Object>> handleValidation(MethodArgumentNotValidException ex) {
		return ResponseEntity.status(HttpStatus.UNPROCESSABLE_ENTITY)
				.body(Map.of("timestamp", Instant.now(), "error", "Validation failed", "details",
						ex.getBindingResult().getFieldErrors().stream()
								.map(err -> err.getField() + ": " + err.getDefaultMessage()).toList()));
	}
}
