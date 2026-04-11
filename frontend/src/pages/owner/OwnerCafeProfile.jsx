import { useEffect, useState } from "react";
import { useOutletContext } from "react-router-dom";
import { resolveMediaUrl, updateCafeProfile, uploadCafeBrandingImage } from "../../api/api";

const DAYS = ["MON", "TUE", "WED", "THU", "FRI", "SAT", "SUN"];

export default function OwnerCafeProfile() {
  const { owner, reloadOwner, token } = useOutletContext();
  const [form, setForm] = useState(null);
  const [saving, setSaving] = useState(false);
  const [uploading, setUploading] = useState(false);
  const [message, setMessage] = useState("");

  useEffect(() => {
    if (!owner) return;
    setForm({
      cafeName: owner.cafeName || "",
      brandName: owner.brandName || "",
      description: owner.description || "",
      cafeType: owner.cafeType || "",
      openingDate: owner.openingDate || "",
      cafeContactNumber: owner.cafeContactNumber || "",
      cafeEmail: owner.cafeEmail || "",
      whatsappNumber: owner.whatsappNumber || "",
      street: owner.street || "",
      landmark: owner.landmark || "",
      city: owner.city || "",
      state: owner.state || "",
      pincode: owner.pincode || "",
      latitude: owner.latitude ?? "",
      longitude: owner.longitude ?? "",
      cafeLogoUrl: owner.cafeLogoUrl || "",
      coverImageUrl: owner.coverImageUrl || "",
      galleryImages: Array.isArray(owner.galleryImages) ? owner.galleryImages.join(",") : "",
      workingDays: owner.workingDays || []
    });
  }, [owner]);

  if (!form) return null;

  const statusTone = owner?.status === "ACTIVE" ? "live" : owner?.status === "REJECTED" ? "rejected" : "pending";

  const toggleDay = (day) => {
    setForm((prev) => {
      const exists = prev.workingDays.includes(day);
      return {
        ...prev,
        workingDays: exists ? prev.workingDays.filter((d) => d !== day) : [...prev.workingDays, day]
      };
    });
  };

  const handleSave = async () => {
    setSaving(true);
    setMessage("");
    try {
      const payload = { ...form };
      payload.latitude = form.latitude === "" ? null : Number(form.latitude);
      payload.longitude = form.longitude === "" ? null : Number(form.longitude);
      payload.galleryImages = form.galleryImages;
      await updateCafeProfile(payload, token);
      setMessage("Profile updated successfully.");
      await reloadOwner();
    } catch (err) {
      setMessage(err?.message || "Failed to update profile.");
    } finally {
      setSaving(false);
    }
  };

  const handleImageUpload = async (field, file) => {
    if (!file) return;
    try {
      setUploading(true);
      setMessage("");
      const response = await uploadCafeBrandingImage(file, token);
      const imageUrl = response?.imageUrl || "";
      if (!imageUrl) {
        throw new Error("Upload failed");
      }
      if (field === "galleryImages") {
        setForm((prev) => ({
          ...prev,
          galleryImages: [prev.galleryImages, imageUrl].filter(Boolean).join(",")
        }));
      } else {
        setForm((prev) => ({ ...prev, [field]: imageUrl }));
      }
      setMessage("Image uploaded successfully.");
    } catch (err) {
      setMessage(err?.message || "Image upload failed.");
    } finally {
      setUploading(false);
    }
  };

  const galleryImages = (form.galleryImages || "")
    .split(",")
    .map((value) => value.trim())
    .filter(Boolean);

  return (
    <div className="owner-page">
      <div className="panel">
        <div className="panel-header">
          <div>
            <h2>Cafe Profile</h2>
            <p>Update your cafe details and contact info.</p>
          </div>
          <div className="panel-actions">
            <span className={`status-pill ${statusTone}`}>{owner?.status || "PENDING"}</span>
            <button className="action-btn" onClick={handleSave} disabled={saving || uploading}>
              {saving ? "Saving..." : uploading ? "Uploading..." : "Save Changes"}
            </button>
          </div>
        </div>

        {message && <div className="owner-alert">{message}</div>}

        <div className="form-grid">
          <Input label="Cafe Name" value={form.cafeName} onChange={(v) => setForm({ ...form, cafeName: v })} />
          <Input label="Brand Name" value={form.brandName} onChange={(v) => setForm({ ...form, brandName: v })} />
          <Select label="Cafe Type" value={form.cafeType} onChange={(v) => setForm({ ...form, cafeType: v })} />
          <Input label="Opening Date" type="date" value={form.openingDate} onChange={(v) => setForm({ ...form, openingDate: v })} />
          <Input label="Description" value={form.description} onChange={(v) => setForm({ ...form, description: v })} />
        </div>

        <div className="section-divider" />

        <div className="form-grid">
          <Input label="Cafe Contact" value={form.cafeContactNumber} onChange={(v) => setForm({ ...form, cafeContactNumber: v })} />
          <Input label="Cafe Email" value={form.cafeEmail} onChange={(v) => setForm({ ...form, cafeEmail: v })} />
          <Input label="WhatsApp" value={form.whatsappNumber} onChange={(v) => setForm({ ...form, whatsappNumber: v })} />
        </div>

        <div className="section-divider" />

        <div className="form-grid">
          <Input label="Street" value={form.street} onChange={(v) => setForm({ ...form, street: v })} />
          <Input label="Landmark" value={form.landmark} onChange={(v) => setForm({ ...form, landmark: v })} />
          <Input label="City" value={form.city} onChange={(v) => setForm({ ...form, city: v })} />
          <Input label="State" value={form.state} onChange={(v) => setForm({ ...form, state: v })} />
          <Input label="Pincode" value={form.pincode} onChange={(v) => setForm({ ...form, pincode: v })} />
          <Input label="Latitude" type="number" value={form.latitude} onChange={(v) => setForm({ ...form, latitude: v })} />
          <Input label="Longitude" type="number" value={form.longitude} onChange={(v) => setForm({ ...form, longitude: v })} />
        </div>

        <div className="section-divider" />

        <div className="form-grid">
          <div className="field">
            <label>Cafe Logo</label>
            <input type="file" accept="image/*" onChange={(e) => handleImageUpload("cafeLogoUrl", e.target.files?.[0])} />
            {form.cafeLogoUrl ? (
              <img className="branding-preview" src={resolveMediaUrl(form.cafeLogoUrl)} alt="Cafe logo" />
            ) : null}
          </div>
          <div className="field">
            <label>Cover Image</label>
            <input type="file" accept="image/*" onChange={(e) => handleImageUpload("coverImageUrl", e.target.files?.[0])} />
            {form.coverImageUrl ? (
              <img className="branding-preview" src={resolveMediaUrl(form.coverImageUrl)} alt="Cafe cover" />
            ) : null}
          </div>
          <div className="field">
            <label>Gallery Images</label>
            <input type="file" accept="image/*" onChange={(e) => handleImageUpload("galleryImages", e.target.files?.[0])} />
            {galleryImages.length > 0 ? (
              <div className="gallery-preview-grid">
                {galleryImages.map((imageUrl) => (
                  <img key={imageUrl} className="branding-preview small" src={resolveMediaUrl(imageUrl)} alt="Gallery" />
                ))}
              </div>
            ) : null}
          </div>
        </div>

        <div className="section-divider" />

        <div className="field">
          <label>Working Days</label>
          <div className="pill-row">
            {DAYS.map((day) => (
              <button
                key={day}
                type="button"
                className={`pill-btn ${form.workingDays.includes(day) ? "active" : ""}`}
                onClick={() => toggleDay(day)}
              >
                {day}
              </button>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}

function Input({ label, value, onChange, type = "text" }) {
  return (
    <div className="field">
      <label>{label}</label>
      <input type={type} value={value} onChange={(e) => onChange(e.target.value)} />
    </div>
  );
}

function Select({ label, value, onChange }) {
  return (
    <div className="field">
      <label>{label}</label>
      <select value={value} onChange={(e) => onChange(e.target.value)}>
        <option value="">Select type</option>
        <option value="CAFE">Cafe</option>
        <option value="RESTAURANT">Restaurant</option>
        <option value="BAKERY">Bakery</option>
        <option value="BEVERAGE_BAR">Beverage Bar</option>
      </select>
    </div>
  );
}
