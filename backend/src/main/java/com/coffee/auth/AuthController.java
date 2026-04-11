package com.coffee.auth;

import com.coffee.user.User;
import com.coffee.user.UserRepository;
import com.coffee.user.UserResponse;
import jakarta.validation.Valid;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.security.core.userdetails.UserDetails;
import org.springframework.web.bind.annotation.*;

@RestController
@RequestMapping("/api/auth")
public class AuthController {

	private final AuthService authService;
	private final UserRepository userRepository;

	public AuthController(AuthService authService, UserRepository userRepository) {
		this.authService = authService;
		this.userRepository = userRepository;
	}

	// ✅ Register
	@PostMapping("/register")
	public ResponseEntity<Void> register(@Valid @RequestBody RegisterRequest request) {
		authService.registerCustomer(request);
		return ResponseEntity.ok().build();
	}

	// ✅ Login
	@PostMapping("/login")
	public ResponseEntity<AuthResponse> login(@Valid @RequestBody LoginRequest request) {
		return ResponseEntity.ok(authService.login(request));
	}

	// ✅ Verify email
	@GetMapping("/verify")
	public ResponseEntity<Void> verify(@RequestParam("token") String token) {
		authService.verifyEmail(token);
		return ResponseEntity.ok().build();
	}

	// ✅ Resend verification mail
	@PostMapping("/resend")
	public ResponseEntity<Void> resend(@Valid @RequestBody ResendVerificationRequest request) {
		authService.resendVerification(request.getEmail());
		return ResponseEntity.ok().build();
	}

	// ✅ Change password (needs JWT)
	@PostMapping("/change-password")
	public ResponseEntity<Void> changePassword(@AuthenticationPrincipal UserDetails userDetails,
			@Valid @RequestBody ChangePasswordRequest request) {

		authService.changePassword(userDetails.getUsername(), request);
		return ResponseEntity.ok().build();
	}

	// ✅ Forgot password (send mail)
	@PostMapping("/forgot-password")
	public ResponseEntity<Void> forgotPassword(@Valid @RequestBody ResendVerificationRequest request) {
		authService.requestPasswordReset(request.getEmail());
		return ResponseEntity.ok().build();
	}

	// ✅ Reset password using token
	@PostMapping("/reset-password")
	public ResponseEntity<Void> resetPassword(@Valid @RequestBody ResetPasswordRequest request) {
		authService.resetPassword(request);
		return ResponseEntity.ok().build();
	}

	// ✅ Get current logged-in user
	@GetMapping("/me")
	public ResponseEntity<UserResponse> me(@AuthenticationPrincipal UserDetails userDetails) {
		User user = userRepository.findByEmailIgnoreCase(userDetails.getUsername())
				.orElseThrow(() -> new IllegalArgumentException("User not found"));

		return ResponseEntity.ok(authService.toResponse(user));
	}
}
