package com.coffee.auth;

import io.jsonwebtoken.Claims;
import io.jsonwebtoken.Jwts;
import io.jsonwebtoken.SignatureAlgorithm;
import io.jsonwebtoken.security.Keys;
import java.nio.charset.StandardCharsets;
import java.security.Key;
import java.time.Instant;
import java.util.Date;
import java.util.Map;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.stereotype.Service;

@Service
public class JwtService {
	private final String secret;
	private final long expirationMinutes;

	public JwtService(@Value("${app.jwt.secret}") String secret,
			@Value("${app.jwt.expiration-minutes}") long expirationMinutes) {
		this.secret = secret;
		this.expirationMinutes = expirationMinutes;
	}

	public String generateToken(String subject, Map<String, Object> claims) {
		Instant now = Instant.now();
		Instant exp = now.plusSeconds(expirationMinutes * 60);

		return Jwts.builder().setClaims(claims).setSubject(subject).setIssuedAt(Date.from(now))
				.setExpiration(Date.from(exp)).signWith(getSigningKey(), SignatureAlgorithm.HS256).compact();
	}

	public String extractSubject(String token) {
		return parseClaims(token).getSubject();
	}

	public boolean isTokenValid(String token, String subject) {
		Claims claims = parseClaims(token);
		return claims.getSubject().equals(subject) && claims.getExpiration().after(new Date());
	}

	private Claims parseClaims(String token) {
		return Jwts.parserBuilder().setSigningKey(getSigningKey()).build().parseClaimsJws(token).getBody();
	}

	private Key getSigningKey() {
		byte[] keyBytes = secret.getBytes(StandardCharsets.UTF_8);
		if (keyBytes.length < 32) {
			byte[] padded = new byte[32];
			System.arraycopy(keyBytes, 0, padded, 0, keyBytes.length);
			keyBytes = padded;
		}
		return Keys.hmacShaKeyFor(keyBytes);
	}
}
