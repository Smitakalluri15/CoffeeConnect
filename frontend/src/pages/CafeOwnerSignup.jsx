import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { registerCafeOwner } from "../api/api";
import "../styles/auth.css";
import "./CafeOwnerAuth.css";

const initialForm = {
  cafeName: "",
  ownerName: "",
  contactNumber: "",
  email: "",
  password: "",
  openingTime: "",
  closingTime: "",
  street: "",
  city: "",
  state: "",
  pincode: "",
  businessType: "",
  fssaiLicenseNumber: "",
  gstNumber: "",
  accountHolderName: "",
  accountNumber: "",
  ifscCode: "",
  upiId: "",
  hasHomeDelivery: false,
  hasTakeaway: false,
  hasDineIn: true
};

export default function CafeOwnerSignup() {
  const [form, setForm] = useState(initialForm);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");
  const navigate = useNavigate();

  const updateField = (field, value) => {
    setForm((prev) => ({ ...prev, [field]: value }));
  };

  const handleSubmit = async (event) => {
    event.preventDefault();
    setLoading(true);
    setError("");
    setSuccess("");

    try {
      await registerCafeOwner(form);
      setSuccess("Cafe owner registered successfully. You can log in now.");
      setTimeout(() => navigate("/cafe-owner/login"), 800);
    } catch (err) {
      setError(err.message || "Registration failed");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="auth-bg">
      <div className="auth-card owner-card">
        <h1 className="owner-title">Cafe Owner Registration</h1>
        <p className="owner-subtitle">Register your cafe and start managing your listings.</p>

        {error && <div className="error-bubble">{error}</div>}
        {success && <div className="success-bubble">{success}</div>}

        <form onSubmit={handleSubmit}>
          <div className="owner-section">
            <h3>Basic Information</h3>
            <div className="owner-form-grid">
              <div className="field">
                <label>Cafe Name</label>
                <input value={form.cafeName} onChange={(e) => updateField("cafeName", e.target.value)} required />
              </div>
              <div className="field">
                <label>Owner Name</label>
                <input value={form.ownerName} onChange={(e) => updateField("ownerName", e.target.value)} required />
              </div>
              <div className="field">
                <label>Contact Number</label>
                <input value={form.contactNumber} onChange={(e) => updateField("contactNumber", e.target.value)} required />
              </div>
              <div className="field">
                <label>Email</label>
                <input type="email" value={form.email} onChange={(e) => updateField("email", e.target.value)} required />
              </div>
              <div className="field">
                <label>Password</label>
                <input type="password" value={form.password} onChange={(e) => updateField("password", e.target.value)} required />
              </div>
              <div className="field">
                <label>Opening Time</label>
                <input type="time" value={form.openingTime} onChange={(e) => updateField("openingTime", e.target.value)} required />
              </div>
              <div className="field">
                <label>Closing Time</label>
                <input type="time" value={form.closingTime} onChange={(e) => updateField("closingTime", e.target.value)} required />
              </div>
            </div>
          </div>

          <div className="owner-section">
            <h3>Address</h3>
            <div className="owner-form-grid">
              <div className="field full">
                <label>Street</label>
                <input value={form.street} onChange={(e) => updateField("street", e.target.value)} required />
              </div>
              <div className="field">
                <label>City</label>
                <input value={form.city} onChange={(e) => updateField("city", e.target.value)} required />
              </div>
              <div className="field">
                <label>State</label>
                <input value={form.state} onChange={(e) => updateField("state", e.target.value)} required />
              </div>
              <div className="field">
                <label>Pincode</label>
                <input value={form.pincode} onChange={(e) => updateField("pincode", e.target.value)} required />
              </div>
            </div>
          </div>

          <div className="owner-section">
            <h3>Business Details</h3>
            <div className="owner-form-grid">
              <div className="field">
                <label>Business Type</label>
                <input value={form.businessType} onChange={(e) => updateField("businessType", e.target.value)} required />
              </div>
              <div className="field">
                <label>FSSAI License Number</label>
                <input value={form.fssaiLicenseNumber} onChange={(e) => updateField("fssaiLicenseNumber", e.target.value)} required />
              </div>
              <div className="field">
                <label>GST Number (optional)</label>
                <input value={form.gstNumber} onChange={(e) => updateField("gstNumber", e.target.value)} />
              </div>
            </div>
          </div>

          <div className="owner-section">
            <h3>Bank Details (optional)</h3>
            <div className="owner-form-grid">
              <div className="field">
                <label>Account Holder Name</label>
                <input value={form.accountHolderName} onChange={(e) => updateField("accountHolderName", e.target.value)} />
              </div>
              <div className="field">
                <label>Account Number</label>
                <input value={form.accountNumber} onChange={(e) => updateField("accountNumber", e.target.value)} />
              </div>
              <div className="field">
                <label>IFSC Code</label>
                <input value={form.ifscCode} onChange={(e) => updateField("ifscCode", e.target.value)} />
              </div>
              <div className="field">
                <label>UPI ID</label>
                <input value={form.upiId} onChange={(e) => updateField("upiId", e.target.value)} />
              </div>
            </div>
          </div>

          <div className="owner-section">
            <h3>Service Features</h3>
            <div className="owner-checkboxes">
              <label>
                <input
                  type="checkbox"
                  checked={form.hasHomeDelivery}
                  onChange={(e) => updateField("hasHomeDelivery", e.target.checked)}
                />
                Home Delivery
              </label>
              <label>
                <input
                  type="checkbox"
                  checked={form.hasTakeaway}
                  onChange={(e) => updateField("hasTakeaway", e.target.checked)}
                />
                Takeaway
              </label>
              <label>
                <input
                  type="checkbox"
                  checked={form.hasDineIn}
                  onChange={(e) => updateField("hasDineIn", e.target.checked)}
                />
                Dine-in
              </label>
            </div>
          </div>

          <div className="owner-actions">
            <button type="submit" className="primary-btn full" disabled={loading}>
              {loading ? "Submitting..." : "Register Cafe"}
            </button>
            <button
              type="button"
              className="btn-back-neat"
              onClick={() => setForm(initialForm)}
              disabled={loading}
            >
              Clear Form
            </button>
          </div>
        </form>

        <p className="owner-helper">
          Already registered? <Link to="/cafe-owner/login">Owner Login</Link>
        </p>
      </div>
    </div>
  );
}
