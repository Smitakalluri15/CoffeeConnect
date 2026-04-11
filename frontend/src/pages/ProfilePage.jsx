import { useEffect, useMemo, useState } from "react";
import { useNavigate } from "react-router-dom";
import { getMyProfile, updateMyProfile } from "../api/api";
import { useAuth } from "../context/AuthContext";
import "./ProfilePage.css";

const emptyForm = {
  firstName: "",
  lastName: "",
  dob: "",
  gender: "",
  street: "",
  plotNo: "",
  city: "",
  pincode: ""
};

export default function ProfilePage() {
  const { token } = useAuth();
  const navigate = useNavigate();

  const [form, setForm] = useState(emptyForm);
  const [profile, setProfile] = useState(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");

  useEffect(() => {
    if (!token) return;
    let active = true;

    const loadProfile = async () => {
      setLoading(true);
      setError("");
      try {
        const data = await getMyProfile(token);
        if (!active) return;
        setProfile(data);
        setForm({
          firstName: data?.firstName || "",
          lastName: data?.lastName || "",
          dob: data?.dob || "",
          gender: data?.gender || "",
          street: data?.street || "",
          plotNo: data?.plotNo || "",
          city: data?.city || "",
          pincode: data?.pincode || ""
        });
      } catch (err) {
        if (!active) return;
        setError(err.message || "Failed to load profile.");
      } finally {
        if (active) setLoading(false);
      }
    };

    loadProfile();
    return () => {
      active = false;
    };
  }, [token]);

  const completion = profile?.completionPercent ?? 0;
  const academicsCount = profile?.academics?.length ?? 0;
  const workCount = profile?.workExperiences?.length ?? 0;

  const metaCards = useMemo(() => ([
    { title: "Profile Completion", value: `${completion}% complete` },
    { title: "Academic Records", value: `${academicsCount} entries` },
    { title: "Work Experience", value: `${workCount} entries` }
  ]), [completion, academicsCount, workCount]);

  const updateField = (field, value) => {
    setForm((prev) => ({ ...prev, [field]: value }));
  };

  const handleSubmit = async (event) => {
    event.preventDefault();
    if (!token) return;

    setSaving(true);
    setError("");
    setSuccess("");

    const payload = { ...form };

    try {
      const updated = await updateMyProfile(payload, token);
      setProfile(updated);
      setSuccess("Profile updated successfully.");
    } catch (err) {
      setError(err.message || "Failed to update profile.");
    } finally {
      setSaving(false);
    }
  };

  if (loading) {
    return (
      <div className="profile-page" style={{ placeItems: "center" }}>
        Loading profile...
      </div>
    );
  }

  return (
    <div className="profile-page">
      <div className="profile-header">
        <div>
          <h1 className="profile-title">Profile Settings</h1>
          <p className="profile-subtitle">Keep your details fresh for faster service.</p>
        </div>
        <button className="profile-btn ghost" onClick={() => navigate("/dashboard")}>
          Back to Dashboard
        </button>
      </div>

      {error && <div className="profile-alert">{error}</div>}
      {success && <div className="profile-success">{success}</div>}

      <div className="profile-card">
        <form onSubmit={handleSubmit}>
          <div className="profile-grid">
            <div className="profile-field">
              <label>First Name</label>
              <input
                type="text"
                value={form.firstName}
                onChange={(e) => updateField("firstName", e.target.value)}
              />
            </div>
            <div className="profile-field">
              <label>Last Name</label>
              <input
                type="text"
                value={form.lastName}
                onChange={(e) => updateField("lastName", e.target.value)}
              />
            </div>
            <div className="profile-field">
              <label>Date of Birth</label>
              <input
                type="date"
                value={form.dob}
                onChange={(e) => updateField("dob", e.target.value)}
              />
            </div>
            <div className="profile-field">
              <label>Gender</label>
              <input
                type="text"
                value={form.gender}
                onChange={(e) => updateField("gender", e.target.value)}
              />
            </div>
            <div className="profile-field">
              <label>Street</label>
              <input
                type="text"
                value={form.street}
                onChange={(e) => updateField("street", e.target.value)}
              />
            </div>
            <div className="profile-field">
              <label>Plot No / Landmark</label>
              <input
                type="text"
                value={form.plotNo}
                onChange={(e) => updateField("plotNo", e.target.value)}
              />
            </div>
            <div className="profile-field">
              <label>City</label>
              <input
                type="text"
                value={form.city}
                onChange={(e) => updateField("city", e.target.value)}
              />
            </div>
            <div className="profile-field">
              <label>Pincode</label>
              <input
                type="text"
                value={form.pincode}
                onChange={(e) => updateField("pincode", e.target.value)}
              />
            </div>
          </div>

          <div className="profile-actions">
            <button className="profile-btn primary" type="submit" disabled={saving}>
              {saving ? "Saving..." : "Save Changes"}
            </button>
            <button
              className="profile-btn ghost"
              type="button"
              onClick={() => setForm(emptyForm)}
              disabled={saving}
            >
              Clear
            </button>
          </div>
        </form>

        <div className="profile-meta">
          {metaCards.map((card) => (
            <div key={card.title} className="profile-meta-card">
              <h4>{card.title}</h4>
              <p>{card.value}</p>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
