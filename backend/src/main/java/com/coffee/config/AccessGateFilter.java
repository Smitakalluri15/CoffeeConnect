package com.coffee.config;

import com.coffee.profile.Profile;
import com.coffee.profile.ProfileRepository;
import com.coffee.user.Role;
import com.coffee.user.User;
import com.coffee.user.UserRepository;
import jakarta.servlet.FilterChain;
import jakarta.servlet.ServletException;
import jakarta.servlet.http.HttpServletRequest;
import jakarta.servlet.http.HttpServletResponse;
import java.io.IOException;
import org.springframework.http.HttpStatus;
import org.springframework.security.authentication.AnonymousAuthenticationToken;
import org.springframework.security.core.Authentication;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.stereotype.Component;
import org.springframework.web.filter.OncePerRequestFilter;

@Component
public class AccessGateFilter extends OncePerRequestFilter {

	private final UserRepository userRepository;
	private final ProfileRepository profileRepository;

	public AccessGateFilter(UserRepository userRepository, ProfileRepository profileRepository) {
		this.userRepository = userRepository;
		this.profileRepository = profileRepository;
	}

	// ✅ Skip access checks for public endpoints
	@Override
	protected boolean shouldNotFilter(HttpServletRequest request) {
		String path = request.getRequestURI();
		return path.startsWith("/api/auth/") || path.startsWith("/ws/") || path.startsWith("/uploads/");
	}

	@Override
	protected void doFilterInternal(HttpServletRequest request, HttpServletResponse response, FilterChain filterChain)
			throws ServletException, IOException {

		Authentication authentication = SecurityContextHolder.getContext().getAuthentication();

		if (authentication == null || authentication instanceof AnonymousAuthenticationToken
				|| !authentication.isAuthenticated()) {
			filterChain.doFilter(request, response);
			return;
		}

		String email = authentication.getName();
		User user = userRepository.findByEmailIgnoreCase(email).orElse(null);

		if (user == null || !user.isActive()) {
			response.sendError(HttpStatus.FORBIDDEN.value(), "Account is inactive");
			return;
		}

		if (!user.isEmailVerified()) {
			response.sendError(HttpStatus.FORBIDDEN.value(), "Email verification required");
			return;
		}

		if (user.isMustResetPassword() && !request.getServletPath().startsWith("/api/auth/change-password")) {
			response.sendError(HttpStatus.FORBIDDEN.value(), "Password reset required");
			return;
		}

		if (user.getRole() == Role.USER) {
			String path = request.getServletPath();
			if (path.startsWith("/api/profile") || path.startsWith("/api/cafes") || path.startsWith("/api/bookings")
					|| path.startsWith("/api/orders") || path.startsWith("/api/payments")
					|| path.startsWith("/uploads/")) {
				filterChain.doFilter(request, response);
				return;
			}

			Profile profile = profileRepository.findByUserId(user.getId()).orElse(null);

			if (profile == null || profile.getCompletionPercent() < 100) {
				response.sendError(HttpStatus.FORBIDDEN.value(), "Complete your profile to continue");
				return;
			}
		}

		filterChain.doFilter(request, response);
	}
}
