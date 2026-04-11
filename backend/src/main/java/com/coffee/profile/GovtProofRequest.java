package com.coffee.profile;

import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.Size;

public class GovtProofRequest {
	@NotBlank
	@Size(max = 40)
	private String idType;

	@NotBlank
	@Size(max = 100)
	private String idNumber;

	@Size(max = 255)
	private String fileName;

	@Size(max = 120)
	private String fileType;

	@NotBlank
	private String fileData;

	public String getIdType() {
		return idType;
	}

	public void setIdType(String idType) {
		this.idType = idType;
	}

	public String getIdNumber() {
		return idNumber;
	}

	public void setIdNumber(String idNumber) {
		this.idNumber = idNumber;
	}

	public String getFileName() {
		return fileName;
	}

	public void setFileName(String fileName) {
		this.fileName = fileName;
	}

	public String getFileType() {
		return fileType;
	}

	public void setFileType(String fileType) {
		this.fileType = fileType;
	}

	public String getFileData() {
		return fileData;
	}

	public void setFileData(String fileData) {
		this.fileData = fileData;
	}
}
