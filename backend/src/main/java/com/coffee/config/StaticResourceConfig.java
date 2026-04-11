package com.coffee.config;

import java.nio.file.Path;
import java.nio.file.Paths;
import java.util.List;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.context.annotation.Configuration;
import org.springframework.web.servlet.config.annotation.ResourceHandlerRegistry;
import org.springframework.web.servlet.config.annotation.WebMvcConfigurer;

@Configuration
public class StaticResourceConfig implements WebMvcConfigurer {
	private final List<Path> uploadDirs;

	public StaticResourceConfig(@Value("${app.upload.base-dir:uploads}") String uploadBaseDir) {
		Path cwd = Paths.get(System.getProperty("user.dir")).toAbsolutePath().normalize();
		Path configuredPath = Paths.get(uploadBaseDir);
		Path primary = configuredPath.isAbsolute() ? configuredPath.normalize()
				: cwd.resolve(configuredPath).normalize();
		Path backendRelative = cwd.resolve("backend").resolve(uploadBaseDir).normalize();
		this.uploadDirs = List.of(primary, backendRelative).stream().distinct().toList();
	}

	@Override
	public void addResourceHandlers(ResourceHandlerRegistry registry) {
		String[] locations = uploadDirs.stream().map(path -> path.toUri().toString()).toArray(String[]::new);
		registry.addResourceHandler("/uploads/**").addResourceLocations(locations);
	}
}
