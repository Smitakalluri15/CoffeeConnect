import { motion } from "framer-motion";
import { ChefHat, ConciergeBell, Pencil, Plus, Power, Trash2 } from "lucide-react";
import { useEffect, useMemo, useState } from "react";
import { useOutletContext } from "react-router-dom";
import PremiumButton from "../../components/ui/PremiumButton";
import PremiumCard from "../../components/ui/PremiumCard";
import PremiumModal from "../../components/ui/PremiumModal";
import PremiumSkeleton from "../../components/ui/PremiumSkeleton";
import {
  createChef,
  createWaiter,
  deleteOwnerStaff,
  getOwnerStaff,
  updateOwnerStaff,
  updateOwnerStaffStatus,
  uploadStaffPhoto
} from "../../api/api";

const DEFAULT_FORM = {
  role: "CHEF",
  fullName: "",
  phoneNumber: "",
  email: "",
  gender: "",
  profilePhotoUrl: "",
  loginId: "",
  password: "",
  shift: "MORNING",
  experience: "",
  specialization: "",
  sectionArea: ""
};

const ROLE_CHOICES = [
  { value: "CHEF", label: "Chef", description: "Kitchen operations and preparation", icon: ChefHat },
  { value: "WAITER", label: "Waiter", description: "Floor service and table management", icon: ConciergeBell }
];

function RoleGlyph({ role, size = 18 }) {
  if (role === "CHEF") return <ChefHat size={size} />;
  return <ConciergeBell size={size} />;
}

function roleLabel(role) {
  return role === "CHEF" ? "Chef" : "Waiter";
}

export default function OwnerStaff() {
  const { owner, token } = useOutletContext();
  const [staff, setStaff] = useState([]);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [uploading, setUploading] = useState(false);
  const [error, setError] = useState("");
  const [filter, setFilter] = useState("CHEF");
  const [editingId, setEditingId] = useState(null);
  const [modalOpen, setModalOpen] = useState(false);
  const [modalStep, setModalStep] = useState(1);
  const [form, setForm] = useState(DEFAULT_FORM);

  const isApproved = owner?.status === "ACTIVE";
  const isEditing = editingId !== null;

  const visibleStaff = useMemo(() => {
    return staff.filter((member) => member.role === filter);
  }, [staff, filter]);

  const roleCounts = useMemo(() => ({
    CHEF: staff.filter((member) => member.role === "CHEF").length,
    WAITER: staff.filter((member) => member.role === "WAITER").length
  }), [staff]);

  const loadStaff = async () => {
    if (!isApproved) {
      setStaff([]);
      setLoading(false);
      return;
    }
    setLoading(true);
    setError("");
    try {
      const data = await getOwnerStaff(token);
      setStaff(Array.isArray(data) ? data : []);
    } catch (err) {
      setError(err?.message || "Failed to load staff.");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadStaff();
  }, [token, isApproved]);

  const openAddModal = () => {
    setEditingId(null);
    setModalStep(1);
    setForm({ ...DEFAULT_FORM, role: filter === "WAITER" ? "WAITER" : "CHEF" });
    setModalOpen(true);
  };

  const openEditModal = (member) => {
    setEditingId(member.id);
    setModalStep(2);
    setForm({
      role: member.role,
      fullName: member.fullName || "",
      phoneNumber: member.phoneNumber || "",
      email: member.email || "",
      gender: member.gender || "",
      profilePhotoUrl: member.profilePhotoUrl || "",
      loginId: member.loginId || "",
      password: "",
      shift: member.shift || "MORNING",
      experience: member.experience || "",
      specialization: member.specialization || "",
      sectionArea: member.sectionArea || ""
    });
    setModalOpen(true);
  };

  const closeModal = () => {
    setEditingId(null);
    setModalStep(1);
    setForm(DEFAULT_FORM);
    setModalOpen(false);
    setSaving(false);
  };

  const updateForm = (field, value) => {
    setForm((prev) => ({ ...prev, [field]: value }));
  };

  const handlePhotoPick = async (file) => {
    if (!file) return;
    try {
      setUploading(true);
      setError("");
      const response = await uploadStaffPhoto(file, token);
      updateForm("profilePhotoUrl", response?.photoUrl || "");
    } catch (err) {
      setError(err?.message || "Failed to upload photo");
    } finally {
      setUploading(false);
    }
  };

  const buildPayload = () => {
    const common = {
      fullName: form.fullName.trim(),
      phoneNumber: form.phoneNumber.trim(),
      email: form.email || null,
      profilePhotoUrl: form.profilePhotoUrl || null,
      loginId: form.loginId || null,
      shift: form.shift
    };

    if (form.role === "CHEF") {
      return {
        ...common,
        gender: form.gender || null,
        experience: form.experience || null,
        specialization: form.specialization || null,
        sectionArea: null
      };
    }

    return {
      ...common,
      gender: null,
      experience: null,
      specialization: null,
      sectionArea: form.sectionArea || null
    };
  };

  const handleNextStep = () => {
    if (!form.role) {
      setError("Choose a staff type to continue.");
      return;
    }
    setModalStep(2);
  };

  const handleBackStep = () => {
    if (isEditing) return;
    setModalStep(1);
  };

  const handleSubmit = async (event) => {
    event.preventDefault();
    if (!isEditing && modalStep !== 2) {
      return;
    }
    if (!form.fullName || !form.phoneNumber || !form.loginId || (!editingId && !form.password)) {
      setError("Full name, phone number, login id, and password are required.");
      return;
    }

    try {
      setSaving(true);
      setError("");
      const payload = buildPayload();
      if (form.password) payload.password = form.password;

      if (editingId) {
        await updateOwnerStaff(editingId, payload, token);
      } else if (form.role === "CHEF") {
        await createChef(payload, token);
      } else {
        await createWaiter(payload, token);
      }

      await loadStaff();
      closeModal();
    } catch (err) {
      setError(err?.message || "Failed to save staff");
      setSaving(false);
    }
  };

  const handleStatusToggle = async (member) => {
    const nextStatus = member.status === "ACTIVE" ? "INACTIVE" : "ACTIVE";
    try {
      setError("");
      await updateOwnerStaffStatus(member.id, nextStatus, token);
      await loadStaff();
    } catch (err) {
      setError(err?.message || "Failed to update status");
    }
  };

  const handleDelete = async (member) => {
    const confirmed = window.confirm(`Delete ${member.fullName}?`);
    if (!confirmed) return;
    try {
      setError("");
      await deleteOwnerStaff(member.id, token);
      await loadStaff();
    } catch (err) {
      setError(err?.message || "Failed to delete staff");
    }
  };

  return (
    <div className="owner-page">
      <PremiumCard className="panel" hover={false}>
        <div className="panel-header">
          <div>
            <h2>Staff Management</h2>
            <p>Choose a role first, then manage the team list for that role.</p>
          </div>
          <div className="panel-actions">
            <PremiumButton onClick={openAddModal}><Plus size={15} /> Add Staff Member</PremiumButton>
          </div>
        </div>

        {!isApproved && <div className="owner-state">Staff management unlocks after approval.</div>}
        {error && <div className="owner-alert">{error}</div>}

        {isApproved && (
          <div className="staff-role-filter-grid">
            {ROLE_CHOICES.map((choice) => {
              const RoleIcon = choice.icon;
              const active = filter === choice.value;
              return (
                <button
                  key={choice.value}
                  type="button"
                  className={`staff-role-filter-card ${active ? "active" : ""}`}
                  onClick={() => setFilter(choice.value)}
                >
                  <div className="staff-role-filter-top">
                    <RoleIcon size={18} />
                    <strong>{choice.label}s</strong>
                  </div>
                  <p>{choice.description}</p>
                  <span>{roleCounts[choice.value]} members</span>
                </button>
              );
            })}
          </div>
        )}

        {loading ? (
          <div className="premium-grid">
            <PremiumSkeleton height={130} />
            <PremiumSkeleton height={130} />
          </div>
        ) : visibleStaff.length === 0 ? (
          <div className="owner-empty-inline">No {roleLabel(filter).toLowerCase()} accounts found yet.</div>
        ) : (
          <div className="staff-grid">
            {visibleStaff.map((member) => (
              <motion.article
                key={member.id}
                className="staff-card"
                whileHover={{ y: -4 }}
              >
                <div className="staff-card-head">
                  <div className="staff-avatar">
                    {member.profilePhotoUrl ? (
                      <img src={member.profilePhotoUrl} alt={member.fullName} />
                    ) : (
                      <RoleGlyph role={member.role} size={18} />
                    )}
                  </div>
                  <div>
                    <h3>{member.fullName}</h3>
                    <p>
                      <span className="staff-role-tag"><RoleGlyph role={member.role} size={12} /> {roleLabel(member.role)}</span>
                      <span>{member.shift}</span>
                    </p>
                  </div>
                </div>

                <div className="staff-details">
                  <span>Phone: {member.phoneNumber}</span>
                  <span>Login: {member.loginId}</span>
                  <span>Status: {member.status}</span>
                  {member.specialization && <span>Specialization: {member.specialization}</span>}
                  {member.experience && <span>Experience: {member.experience}</span>}
                  {member.sectionArea && <span>Section: {member.sectionArea}</span>}
                </div>

                <div className="menu-item-actions">
                  <PremiumButton type="button" variant="secondary" iconOnly onClick={() => openEditModal(member)}>
                    <Pencil size={15} />
                  </PremiumButton>
                  <PremiumButton type="button" variant="ghost" iconOnly onClick={() => handleStatusToggle(member)}>
                    <Power size={15} />
                  </PremiumButton>
                  <PremiumButton type="button" variant="danger" iconOnly onClick={() => handleDelete(member)}>
                    <Trash2 size={15} />
                  </PremiumButton>
                </div>
              </motion.article>
            ))}
          </div>
        )}
      </PremiumCard>

      <PremiumModal
        open={modalOpen}
        title={isEditing ? "Update Staff Account" : (modalStep === 1 ? "Add Staff Member" : `Add ${roleLabel(form.role)}`)}
        subtitle={isEditing ? "Update profile and login details." : `Step ${modalStep} of 2`}
        onClose={closeModal}
      >
        <form className="premium-form-grid" onSubmit={handleSubmit}>
          {!isEditing && (
            <div className="full staff-modal-steps">
              <div className={`staff-modal-step ${modalStep === 1 ? "active" : "done"}`}>
                <span>1</span>
                Choose Role
              </div>
              <div className={`staff-modal-step ${modalStep === 2 ? "active" : ""}`}>
                <span>2</span>
                Member Details
              </div>
            </div>
          )}

          {!isEditing && modalStep === 1 ? (
            <>
              <div className="premium-field full">
                <label>Select Staff Type</label>
                <div className="staff-role-select">
                  {ROLE_CHOICES.map((choice) => {
                    const Icon = choice.icon;
                    return (
                      <button
                        key={choice.value}
                        type="button"
                        className={`staff-role-card ${form.role === choice.value ? "active" : ""}`}
                        onClick={() => updateForm("role", choice.value)}
                      >
                        <Icon size={18} />
                        <span>{choice.label}</span>
                        <small>{choice.description}</small>
                      </button>
                    );
                  })}
                </div>
              </div>
              <div className="full staff-form-actions">
                <PremiumButton type="button" variant="ghost" onClick={closeModal}>Cancel</PremiumButton>
                <PremiumButton type="button" onClick={handleNextStep}>Continue</PremiumButton>
              </div>
            </>
          ) : (
            <>
              {!isEditing && (
                <div className="full staff-modal-role-pill">
                  <RoleGlyph role={form.role} size={16} />
                  Creating {roleLabel(form.role)} account
                </div>
              )}

              <div className="premium-field">
                <label>Full Name</label>
                <input value={form.fullName} onChange={(event) => updateForm("fullName", event.target.value)} required />
              </div>
              <div className="premium-field">
                <label>Phone Number</label>
                <input value={form.phoneNumber} onChange={(event) => updateForm("phoneNumber", event.target.value)} required />
              </div>
              <div className="premium-field">
                <label>Email (optional)</label>
                <input type="email" value={form.email} onChange={(event) => updateForm("email", event.target.value)} />
              </div>
              <div className="premium-field">
                <label>Login ID</label>
                <input value={form.loginId} onChange={(event) => updateForm("loginId", event.target.value)} required />
              </div>
              <div className="premium-field">
                <label>{editingId ? "Password (optional)" : "Password"}</label>
                <input
                  type="password"
                  value={form.password}
                  onChange={(event) => updateForm("password", event.target.value)}
                  required={!editingId}
                />
              </div>
              <div className="premium-field">
                <label>Shift</label>
                <select value={form.shift} onChange={(event) => updateForm("shift", event.target.value)}>
                  <option value="MORNING">Morning</option>
                  <option value="EVENING">Evening</option>
                  <option value="FULL_DAY">Full Day</option>
                </select>
              </div>
              {form.role === "CHEF" ? (
                <>
                  <div className="premium-field">
                    <label>Experience</label>
                    <input value={form.experience} onChange={(event) => updateForm("experience", event.target.value)} />
                  </div>
                  <div className="premium-field">
                    <label>Specialization</label>
                    <input value={form.specialization} onChange={(event) => updateForm("specialization", event.target.value)} />
                  </div>
                  <div className="premium-field">
                    <label>Gender</label>
                    <input value={form.gender} onChange={(event) => updateForm("gender", event.target.value)} />
                  </div>
                </>
              ) : (
                <div className="premium-field">
                  <label>Section / Table Area</label>
                  <input value={form.sectionArea} onChange={(event) => updateForm("sectionArea", event.target.value)} />
                </div>
              )}

              <div className="premium-field full">
                <label>Profile Photo</label>
                <input type="file" accept="image/*" onChange={(event) => handlePhotoPick(event.target.files?.[0])} />
                <small>{uploading ? "Uploading..." : form.profilePhotoUrl ? "Photo uploaded" : "Optional"}</small>
              </div>

              <div className="full staff-form-actions">
                {!isEditing && <PremiumButton type="button" variant="ghost" onClick={handleBackStep}>Back</PremiumButton>}
                <PremiumButton type="button" variant="ghost" onClick={closeModal}>Cancel</PremiumButton>
                <PremiumButton type="submit" disabled={saving || uploading}>{saving ? "Saving..." : "Save"}</PremiumButton>
              </div>
            </>
          )}
        </form>
      </PremiumModal>
    </div>
  );
}
