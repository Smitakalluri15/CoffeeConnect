package com.coffee.cafeowner;

import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.Pattern;
import jakarta.validation.constraints.Size;

public class CafeOwnerComplianceRequest {
	@NotBlank(message = "{cafe.owner.fssai.required}")
	@Size(max = 50, message = "{cafe.owner.fssai.size}")
	private String fssaiLicenseNumber;

	@Pattern(regexp = "^$|[0-9A-Z]{15}$", message = "{cafe.owner.gst.invalid}")
	private String gstNumber;

	@NotBlank(message = "{cafe.owner.licenseDoc.required}")
	@Size(max = 300, message = "{cafe.owner.licenseDoc.size}")
	private String licenseDocumentUrl;

	@Size(max = 300, message = "{cafe.owner.shopPhoto.size}")
	private String shopPhotoUrl;

	@Size(max = 300, message = "{cafe.owner.ownerIdProof.size}")
	private String ownerIdProofUrl;

	public String getFssaiLicenseNumber() {
		return fssaiLicenseNumber;
	}

	public void setFssaiLicenseNumber(String fssaiLicenseNumber) {
		this.fssaiLicenseNumber = fssaiLicenseNumber;
	}

	public String getGstNumber() {
		return gstNumber;
	}

	public void setGstNumber(String gstNumber) {
		this.gstNumber = gstNumber;
	}

	public String getLicenseDocumentUrl() {
		return licenseDocumentUrl;
	}

	public void setLicenseDocumentUrl(String licenseDocumentUrl) {
		this.licenseDocumentUrl = licenseDocumentUrl;
	}

	public String getShopPhotoUrl() {
		return shopPhotoUrl;
	}

	public void setShopPhotoUrl(String shopPhotoUrl) {
		this.shopPhotoUrl = shopPhotoUrl;
	}

	public String getOwnerIdProofUrl() {
		return ownerIdProofUrl;
	}

	public void setOwnerIdProofUrl(String ownerIdProofUrl) {
		this.ownerIdProofUrl = ownerIdProofUrl;
	}
}
