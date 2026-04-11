package com.coffee.signup;

import jakarta.validation.Valid;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

@RestController
@RequestMapping("/api/signup")
public class SignupController {
	private final SignupService signupService;

	public SignupController(SignupService signupService) {
		this.signupService = signupService;
	}

	@PostMapping
	public ResponseEntity<SignupResponse> register(@Valid @RequestBody SignupRequest request) {
		return ResponseEntity.ok(signupService.register(request));
	}
}
