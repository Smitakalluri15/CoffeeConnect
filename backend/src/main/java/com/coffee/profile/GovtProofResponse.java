package com.coffee.profile;

public class GovtProofResponse {
	private Long id;
	private String idType;
	private String idNumber;
	private String fileName;
	private String fileType;
	private String fileData;

	public GovtProofResponse(Long id, String idType, String idNumber, String fileName, String fileType,
			String fileData) {
		this.id = id;
		this.idType = idType;
		this.idNumber = idNumber;
		this.fileName = fileName;
		this.fileType = fileType;
		this.fileData = fileData;
	}

	public Long getId() {
		return id;
	}

	public String getIdType() {
		return idType;
	}

	public String getIdNumber() {
		return idNumber;
	}

	public String getFileName() {
		return fileName;
	}

	public String getFileType() {
		return fileType;
	}

	public String getFileData() {
		return fileData;
	}
}
