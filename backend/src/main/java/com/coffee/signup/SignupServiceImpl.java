package com.coffee.signup;

import com.coffee.auth.AuthService;
import com.coffee.auth.RegisterRequest;
import com.coffee.cafeowner.CafeOwnerRegistrationRequest;
import com.coffee.cafeowner.CafeOwnerResponse;
import com.coffee.cafeowner.CafeOwnerService;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

@Service
public class SignupServiceImpl implements SignupService {
	private static final Logger log = LoggerFactory.getLogger(SignupServiceImpl.class);

	private final AuthService authService;
	private final CafeOwnerService cafeOwnerService;

	public SignupServiceImpl(AuthService authService, CafeOwnerService cafeOwnerService) {
		this.authService = authService;
		this.cafeOwnerService = cafeOwnerService;
	}

	@Override
	@Transactional
	public SignupResponse register(SignupRequest request) {
		if (request.getRole() == SignupRole.USER) {
			return registerUser(request.getUser());
		}
		return registerOwner(request.getCafeOwner());
	}

	private SignupResponse registerUser(RegisterRequest request) {
		authService.registerCustomer(request);
		log.info("User signup completed: {}", request.getEmail());
		return new SignupResponse(SignupRole.USER, "User registration received", null);
	}

	private SignupResponse registerOwner(CafeOwnerRegistrationRequest request) {
		CafeOwnerResponse response = cafeOwnerService.register(request);
		log.info("Cafe owner signup completed: {}", response.getEmail());
		return new SignupResponse(SignupRole.CAFE_OWNER, "Cafe owner registration received", response.getId());
	}
}
