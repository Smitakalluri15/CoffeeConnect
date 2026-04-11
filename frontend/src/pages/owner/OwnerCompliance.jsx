import { useEffect, useState } from "react";
import { useOutletContext } from "react-router-dom";
import { updateCafeCompliance } from "../../api/api";

export default function OwnerCompliance() {
  const { owner, reloadOwner, token } = useOutletContext();
  const [form, setForm] = useState(null);
  const [saving, setSaving] = useState(false);
  const [message, setMessage] = useState("");

  useEffect(() => {
    if (!owner) return;
    setForm({
      fssaiLicenseNumber: owner.fssaiLicenseNumber || "",
      gstNumber: owner.gstNumber || "",
      licenseDocumentUrl: owner.licenseDocumentUrl || "",
      shopPhotoUrl: owner.shopPhotoUrl || "",
      ownerIdProofUrl: owner.ownerIdProofUrl || ""
    });
  }, [owner]);

  if (!form) return null;

  const handleSave = async () => {
    setSaving(true);
    setMessage("");
    try {
      await updateCafeCompliance(form, token);
      setMessage("Compliance details updated.");
      await reloadOwner();
    } catch (err) {
      setMessage(err?.message || "Failed to update compliance.");
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="owner-page">
      <div className="panel">
        <div className="panel-header">
          <div>
            <h2>Compliance</h2>
            <p>Business and legal documents.</p>
          </div>
          <button className="action-btn" onClick={handleSave} disabled={saving}>
            {saving ? "Saving..." : "Save"}
          </button>
        </div>

        <div className={`status-pill ${owner?.verificationStatus === "VERIFIED" ? "live" : "pending"}`}>
          {owner?.verificationStatus || "Pending"}
        </div>

        {owner?.status === "REJECTED" && (
          <div className="owner-alert rejected">Admin remark: {owner.rejectionReason || "Please update compliance."}</div>
        )}

        {message && <div className="owner-alert">{message}</div>}

        <div className="form-grid">
          <Input label="FSSAI License Number" value={form.fssaiLicenseNumber} onChange={(v) => setForm({ ...form, fssaiLicenseNumber: v })} />
          <Input label="GST Number" value={form.gstNumber} onChange={(v) => setForm({ ...form, gstNumber: v })} />
          <Input label="License Document URL" value={form.licenseDocumentUrl} onChange={(v) => setForm({ ...form, licenseDocumentUrl: v })} />
          <Input label="Shop Photo URL" value={form.shopPhotoUrl} onChange={(v) => setForm({ ...form, shopPhotoUrl: v })} />
          <Input label="Owner ID Proof URL" value={form.ownerIdProofUrl} onChange={(v) => setForm({ ...form, ownerIdProofUrl: v })} />
        </div>
      </div>
    </div>
  );
}

function Input({ label, value, onChange }) {
  return (
    <div className="field">
      <label>{label}</label>
      <input value={value} onChange={(e) => onChange(e.target.value)} />
    </div>
  );
}
