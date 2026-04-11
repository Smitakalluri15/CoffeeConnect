package com.coffee;

import org.springframework.boot.SpringApplication;
import org.springframework.boot.autoconfigure.SpringBootApplication;
import org.springframework.scheduling.annotation.EnableScheduling;

@SpringBootApplication
@EnableScheduling
public class CoffeeBackendApplication {

	public static void main(String[] args) {
		SpringApplication.run(CoffeeBackendApplication.class, args);
	}
}
