package com.coffee.booking;

import com.coffee.cafeowner.CafeOwnerProfile;
import com.coffee.cafeowner.CafeOwnerProfileRepository;
import com.coffee.cafeowner.CafeOwnerStatus;
import com.coffee.common.NotFoundException;
import com.coffee.user.User;
import com.coffee.user.UserRepository;
import java.util.List;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

@Service
public class BookingServiceImpl implements BookingService {
	private final BookingRepository bookingRepository;
	private final CafeOwnerProfileRepository cafeOwnerRepository;
	private final UserRepository userRepository;

	public BookingServiceImpl(BookingRepository bookingRepository, CafeOwnerProfileRepository cafeOwnerRepository,
			UserRepository userRepository) {
		this.bookingRepository = bookingRepository;
		this.cafeOwnerRepository = cafeOwnerRepository;
		this.userRepository = userRepository;
	}

	@Override
	@Transactional
	public BookingResponse createBooking(String userEmail, BookingRequest request) {
		User user = getUser(userEmail);
		CafeOwnerProfile cafeOwner = getActiveCafe(request.getCafeOwnerId());
		CafeBooking booking = buildBooking(user, cafeOwner, request);
		CafeBooking saved = bookingRepository.save(booking);
		return toResponse(saved);
	}

	@Override
	@Transactional(readOnly = true)
	public List<BookingResponse> getUserBookings(String userEmail) {
		User user = getUser(userEmail);
		return bookingRepository.findByUserOrderByBookingDateAsc(user).stream().map(this::toResponse).toList();
	}

	@Override
	@Transactional(readOnly = true)
	public List<BookingResponse> getOwnerBookings(String ownerEmail) {
		CafeOwnerProfile owner = getOwner(ownerEmail);
		return bookingRepository.findByCafeOwnerOrderByBookingDateAsc(owner).stream().map(this::toResponse).toList();
	}

	@Override
	@Transactional
	public BookingResponse updateStatus(String ownerEmail, Long bookingId, BookingStatus status) {
		CafeBooking booking = getOwnerBooking(ownerEmail, bookingId);
		booking.setStatus(status);
		return toResponse(booking);
	}

	private CafeBooking buildBooking(User user, CafeOwnerProfile cafeOwner, BookingRequest request) {
		CafeBooking booking = new CafeBooking();
		booking.setUser(user);
		booking.setCafeOwner(cafeOwner);
		booking.setBookingDate(request.getBookingDate());
		booking.setTimeSlot(request.getTimeSlot());
		booking.setPartySize(request.getPartySize());
		booking.setSeatingPreference(trimOptional(request.getSeatingPreference()));
		booking.setNotes(trimOptional(request.getNotes()));
		booking.setStatus(BookingStatus.NEW);
		return booking;
	}

	private User getUser(String email) {
		return userRepository.findByEmail(normalizeEmail(email))
				.orElseThrow(() -> new NotFoundException("User not found"));
	}

	private CafeOwnerProfile getActiveCafe(Long cafeOwnerId) {
		CafeOwnerProfile profile = cafeOwnerRepository.findById(cafeOwnerId)
				.orElseThrow(() -> new NotFoundException("Cafe not found"));
		if (profile.getStatus() != CafeOwnerStatus.ACTIVE || !profile.isCafeVisible()) {
			throw new IllegalArgumentException("Cafe is not available for booking");
		}
		return profile;
	}

	private CafeOwnerProfile getOwner(String email) {
		return cafeOwnerRepository.findByEmail(normalizeEmail(email))
				.orElseThrow(() -> new NotFoundException("Cafe owner not found"));
	}

	private CafeBooking getOwnerBooking(String ownerEmail, Long bookingId) {
		CafeOwnerProfile owner = getOwner(ownerEmail);
		CafeBooking booking = bookingRepository.findById(bookingId)
				.orElseThrow(() -> new NotFoundException("Booking not found"));
		if (!booking.getCafeOwner().getId().equals(owner.getId())) {
			throw new IllegalArgumentException("Booking does not belong to cafe");
		}
		return booking;
	}

	private BookingResponse toResponse(CafeBooking booking) {
		return new BookingResponse(booking.getId(), booking.getCafeOwner().getId(),
				booking.getCafeOwner().getCafeName(), booking.getBookingDate(), booking.getTimeSlot(),
				booking.getPartySize(), booking.getSeatingPreference(), booking.getNotes(), booking.getAssignedTable(),
				booking.getStatus(), booking.getUser().getEmail(), booking.getCreatedAt());
	}

	private String normalizeEmail(String email) {
		return email == null ? null : email.trim().toLowerCase();
	}

	private String trimOptional(String value) {
		if (value == null) {
			return null;
		}
		String trimmed = value.trim();
		return trimmed.isEmpty() ? null : trimmed;
	}
}
