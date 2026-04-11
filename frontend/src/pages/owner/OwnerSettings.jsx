import { useEffect, useState } from "react";
import { useOutletContext } from "react-router-dom";
import { updateCafeSettings } from "../../api/api";

export default function OwnerSettings() {
  const { owner, reloadOwner, token } = useOutletContext();
  const [form, setForm] = useState(null);
  const [saving, setSaving] = useState(false);
  const [message, setMessage] = useState("");

  useEffect(() => {
    if (!owner) return;
    setForm({
      cafeVisible: owner.cafeVisible ?? true,
      minOrderValue: owner.minOrderValue ?? "",
      prepTimeMinutes: owner.prepTimeMinutes ?? ""
    });
  }, [owner]);

  if (!form) return null;

  const handleSave = async () => {
    setSaving(true);
    setMessage("");
    try {
      const payload = {
        cafeVisible: Boolean(form.cafeVisible),
        ordersPaused: false,
        minOrderValue: form.minOrderValue === "" ? null : Number(form.minOrderValue),
        prepTimeMinutes: form.prepTimeMinutes === "" ? null : Number(form.prepTimeMinutes)
      };
      await updateCafeSettings(payload, token);
      setMessage("Settings updated.");
      await reloadOwner();
    } catch (err) {
      setMessage(err?.message || "Failed to update settings.");
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="owner-page">
      <div className="panel">
        <div className="panel-header">
          <div>
            <h2>Settings</h2>
            <p>Control visibility and booking thresholds.</p>
          </div>
          <button className="action-btn" onClick={handleSave} disabled={saving}>
            {saving ? "Saving..." : "Save"}
          </button>
        </div>

        {message && <div className="owner-alert">{message}</div>}

        <div className="form-grid">
          <label className="checkbox-field">
            <input
              type="checkbox"
              checked={form.cafeVisible}
              onChange={(e) => setForm({ ...form, cafeVisible: e.target.checked })}
            />
            Cafe Open/Visible
          </label>
        </div>

        <div className="section-divider" />

        <div className="form-grid">
          <Input label="Minimum Order Value" type="number" value={form.minOrderValue} onChange={(v) => setForm({ ...form, minOrderValue: v })} />
          <Input label="Estimated Prep Time (mins)" type="number" value={form.prepTimeMinutes} onChange={(v) => setForm({ ...form, prepTimeMinutes: v })} />
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
