package com.coffee.notification;

import jakarta.mail.internet.MimeMessage;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.mail.javamail.JavaMailSender;
import org.springframework.mail.javamail.MimeMessageHelper;
import org.springframework.stereotype.Service;

@Service
public class EmailService {
	private static final Logger log = LoggerFactory.getLogger(EmailService.class);

	private final JavaMailSender mailSender;
	private final String mailFrom;
	private final String smtpHost;

	public EmailService(JavaMailSender mailSender, @Value("${app.mail.from}") String mailFrom,
			@Value("${spring.mail.host:}") String smtpHost) {
		this.mailSender = mailSender;
		this.mailFrom = mailFrom;
		this.smtpHost = smtpHost;
	}

	public void sendEmail(String to, String subject, String body) {
		if (smtpHost == null || smtpHost.isBlank()) {
			log.info("SMTP not configured. Skipping email to {}. Subject: {}", to, subject);
			log.info("Email body:\n{}", body);
			return;
		}
		try {
			MimeMessage message = mailSender.createMimeMessage();
			MimeMessageHelper helper = new MimeMessageHelper(message, "UTF-8");
			helper.setFrom(mailFrom);
			helper.setTo(to);
			helper.setSubject(subject);
			helper.setText(body, false);
			mailSender.send(message);
		} catch (Exception ex) {
			log.error("Failed to send email to {}", to, ex);
		}
	}
}
