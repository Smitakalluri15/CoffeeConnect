import { useMemo, useState } from "react";
import { Link, useNavigate, useSearchParams } from "react-router-dom";
import { AnimatePresence, motion } from "framer-motion";
import "../styles/auth.css";
import "./SignupPremium.css";
import { registerCafeOwner, registerUser, resolveMediaUrl, uploadCafeBrandingImageForSignup } from "../api/api";

const ROLE = {
  USER: "USER",
  CAFE_OWNER: "CAFE_OWNER"
};

const defaultCustomerForm = {
  personalDetails: {
    firstName: "",
    lastName: "",
    email: "",
    dob: "",
    contactNo: "",
    gender: "",
    maritalStatus: ""
  },
  address: { street: "", landmark: "", city: "", state: "", pincode: "", country: "India" },
  academicInfoList: [
    { id: Date.now(), institutionName: "", degree: "", passingYear: "", grade: "", gradeInPercentage: "" }
  ],
  workExperienceList: [
    {
      id: Date.now() + 1,
      startDate: "",
      endDate: "",
      currentlyWorking: false,
      companyName: "",
      designation: "",
      ctc: "",
      reasonForLeaving: ""
    }
  ],
  govtProof: {
    idType: "",
    idNumber: "",
    file: null,
    fileName: "",
    fileType: "",
    fileDataUrl: "",
    filePreview: ""
  },
  password: ""
};

const defaultOwnerForm = {
  email: "",
  password: "",
  ownerName: "",
  contactNumber: "",
  cafeName: "",
  brandName: "",
  description: "",
  cafeType: "",
  openingDate: "",
  street: "",
  landmark: "",
  city: "",
  state: "",
  pincode: "",
  latitude: "",
  longitude: "",
  cafeContactNumber: "",
  cafeEmail: "",
  whatsappNumber: "",
  openingTime: "",
  closingTime: "",
  workingDays: [],
  hasHomeDelivery: false,
  hasTakeaway: false,
  hasDineIn: true,
  fssaiLicenseNumber: "",
  gstNumber: "",
  shopPhotoUrl: "",
  licenseDocumentUrl: "",
  ownerIdProofUrl: "",
  cafeLogoUrl: "",
  coverImageUrl: "",
  galleryImages: "",
  accountHolderName: "",
  accountNumber: "",
  ifscCode: "",
  upiId: "",
  acceptCash: true,
  cafeVisible: true,
  ordersPaused: false,
  minOrderValue: "",
  prepTimeMinutes: ""
};

const USER_STEPS = [
  { key: "role", label: "Role & Account" },
  { key: "personal", label: "Personal" },
  { key: "address", label: "Address" },
  { key: "academics", label: "Academics" },
  { key: "work", label: "Work" },
  { key: "govt", label: "Govt Proof" }
];

const OWNER_STEPS = [
  { key: "role", label: "Account" },
  { key: "owner", label: "Owner Details" },
  { key: "cafe", label: "Cafe Info" },
  { key: "location", label: "Location & Contact" },
  { key: "operations", label: "Operations" },
  { key: "documents", label: "Documents" },
  { key: "branding", label: "Branding" },
  { key: "payments", label: "Payments & Settings" }
];

export default function SignupPage({ defaultRole }) {
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();

  const initialRole = useMemo(() => {
    const param = (searchParams.get("role") || "").toLowerCase();
    if (param === "owner" || param === "cafe_owner" || param === "cafe-owner") {
      return ROLE.CAFE_OWNER;
    }
    return defaultRole || ROLE.USER;
  }, [searchParams, defaultRole]);

  const [role, setRole] = useState(initialRole);
  const [stepIndex, setStepIndex] = useState(0);

  const steps = role === ROLE.USER ? USER_STEPS : OWNER_STEPS;
  const currentStep = steps[stepIndex];
  const totalSteps = steps.length;
  const progress = Math.round(((stepIndex + 1) / totalSteps) * 100);

  const goNext = () => setStepIndex((prev) => Math.min(prev + 1, totalSteps - 1));
  const goBack = () => setStepIndex((prev) => Math.max(prev - 1, 0));

  return (
    <div className="auth-bg premium-signup">
      <div className="signup-shell">
        <aside className="signup-side">
          <div className="signup-brand">
            <span className="signup-logo">CoffeeConnect</span>
            <p>Premium onboarding for users and cafe partners.</p>
          </div>

          <div className="signup-progress">
            <div className="progress-bar">
              <div className="progress-fill" style={{ width: `${progress}%` }} />
            </div>
            <div className="progress-meta">
              <span>Step {stepIndex + 1} of {totalSteps}</span>
              <strong>{currentStep.label}</strong>
            </div>
          </div>

          <div className="signup-steps">
            {steps.map((step, index) => (
              <div key={step.key} className={`step-item ${index === stepIndex ? "active" : ""} ${index < stepIndex ? "done" : ""}`}>
                <span>{String(index + 1).padStart(2, "0")}</span>
                <div>
                  <p>{step.label}</p>
                  <small>{index < stepIndex ? "Completed" : index === stepIndex ? "In progress" : "Pending"}</small>
                </div>
              </div>
            ))}
          </div>

          <div className="signup-note">
            <h4>Need help?</h4>
            <p>Use a real email and phone. You can edit details later.</p>
          </div>
        </aside>

        <section className="signup-main">
          <header className="signup-top">
            <div>
              <h1>Create Your Account</h1>
              <p>Select your role and complete the steps.</p>
            </div>
            <div className="role-toggle" role="tablist" aria-label="Signup role">
              <div className={`role-indicator ${role === ROLE.CAFE_OWNER ? "right" : "left"}`} />
              <button
                type="button"
                className={`role-btn ${role === ROLE.USER ? "active" : ""}`}
                role="tab"
                aria-selected={role === ROLE.USER}
                onClick={() => {
                  setRole(ROLE.USER);
                  setStepIndex(0);
                }}
              >
                User
              </button>
              <button
                type="button"
                className={`role-btn ${role === ROLE.CAFE_OWNER ? "active" : ""}`}
                role="tab"
                aria-selected={role === ROLE.CAFE_OWNER}
                onClick={() => {
                  setRole(ROLE.CAFE_OWNER);
                  setStepIndex(0);
                }}
              >
                Cafe Owner
              </button>
            </div>
          </header>

          {role === ROLE.USER ? (
            <CustomerSteps
              stepKey={currentStep.key}
              onComplete={() => navigate("/login")}
              onNext={goNext}
              onBack={goBack}
              isFirst={stepIndex === 0}
              isLast={stepIndex === totalSteps - 1}
            />
          ) : (
            <OwnerSteps
              stepKey={currentStep.key}
              onComplete={() => navigate("/cafe-owner/login")}
              onNext={goNext}
              onBack={goBack}
              isFirst={stepIndex === 0}
              isLast={stepIndex === totalSteps - 1}
            />
          )}
        </section>
      </div>
    </div>
  );
}

function CustomerSteps({ stepKey, onComplete, onNext, onBack, isFirst, isLast }) {
  const [form, setForm] = useState(defaultCustomerForm);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");

  const updateNested = (section, field, value) => {
    setForm((prev) => ({ ...prev, [section]: { ...prev[section], [field]: value } }));
  };

  const updateArray = (listName, id, field, value) => {
    setForm((prev) => ({
      ...prev,
      [listName]: prev[listName].map((item) => (item.id === id ? { ...item, [field]: value } : item))
    }));
  };

  const addItem = (listName) => {
    const newItem =
      listName === "academicInfoList"
        ? { id: Date.now(), institutionName: "", degree: "", passingYear: "", grade: "", gradeInPercentage: "" }
        : {
            id: Date.now(),
            startDate: "",
            endDate: "",
            currentlyWorking: false,
            companyName: "",
            designation: "",
            ctc: "",
            reasonForLeaving: ""
          };
    setForm((prev) => ({ ...prev, [listName]: [...prev[listName], newItem] }));
  };

  const handleNext = async () => {
    try {
      setError("");
      validateCustomerStep(stepKey, form);
      onNext();
    } catch (err) {
      setError(err.message || "Please complete the required fields.");
    }
  };

  const handleSubmit = async () => {
    setLoading(true);
    setError("");
    setSuccess("");

    try {
      const payload = buildCustomerPayload(form);
      validateCustomerPayload(payload);
      await registerUser(payload);
      setSuccess("Signup successful! Your profile is pending admin approval.");
      if (onComplete) {
        setTimeout(() => onComplete(), 800);
      }
    } catch (err) {
      setError(err.message || "Signup failed");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="signup-form">
      {error && <div className="error-bubble">{error}</div>}
      {success && <div className="success-bubble">{success}</div>}

      <AnimatePresence mode="wait">
        <motion.div
          key={stepKey}
          initial={{ opacity: 0, y: 12 }}
          animate={{ opacity: 1, y: 0 }}
          exit={{ opacity: 0, y: -12 }}
          transition={{ duration: 0.25 }}
        >
          {stepKey === "role" && (
            <Section title="Account Setup" subtitle="Start with your login credentials.">
              <div className="signup-grid">
                <Input label="Email" type="email" value={form.personalDetails.email} onChange={(v) => updateNested("personalDetails", "email", v)} />
                <Input label="Password" type="password" value={form.password} onChange={(v) => setForm((prev) => ({ ...prev, password: v }))} />
              </div>
            </Section>
          )}

          {stepKey === "personal" && (
            <Section title="Personal Details" subtitle="Tell us who you are.">
              <div className="signup-grid">
                <Input label="First Name" value={form.personalDetails.firstName} onChange={(v) => updateNested("personalDetails", "firstName", v)} />
                <Input label="Last Name" value={form.personalDetails.lastName} onChange={(v) => updateNested("personalDetails", "lastName", v)} />
                <Input label="Contact No" value={form.personalDetails.contactNo} onChange={(v) => updateNested("personalDetails", "contactNo", v)} />
                <Input label="DOB" type="date" value={form.personalDetails.dob} onChange={(v) => updateNested("personalDetails", "dob", v)} />
                <Input label="Gender" value={form.personalDetails.gender} onChange={(v) => updateNested("personalDetails", "gender", v)} />
                <Input label="Marital Status" value={form.personalDetails.maritalStatus} onChange={(v) => updateNested("personalDetails", "maritalStatus", v)} />
              </div>
            </Section>
          )}

          {stepKey === "address" && (
            <Section title="Address" subtitle="We use this for table bookings and deliveries.">
              <div className="signup-grid">
                <Input label="Street / House No" value={form.address.street} onChange={(v) => updateNested("address", "street", v)} />
                <Input label="Landmark" value={form.address.landmark} onChange={(v) => updateNested("address", "landmark", v)} />
                <Input label="City" value={form.address.city} onChange={(v) => updateNested("address", "city", v)} />
                <Input label="State" value={form.address.state} onChange={(v) => updateNested("address", "state", v)} />
                <Input label="Pincode" value={form.address.pincode} onChange={(v) => updateNested("address", "pincode", v)} />
                <Input label="Country" value={form.address.country} onChange={(v) => updateNested("address", "country", v)} />
              </div>
            </Section>
          )}

          {stepKey === "academics" && (
            <Section title="Academic Details" subtitle="Add at least one record.">
              {form.academicInfoList.map((item) => (
                <div key={item.id} className="signup-grid">
                  <Input label="Institution" value={item.institutionName} onChange={(v) => updateArray("academicInfoList", item.id, "institutionName", v)} />
                  <Input label="Degree" value={item.degree} onChange={(v) => updateArray("academicInfoList", item.id, "degree", v)} />
                  <Input label="Passing Year" value={item.passingYear} onChange={(v) => updateArray("academicInfoList", item.id, "passingYear", v)} />
                  <Input label="Grade" value={item.grade} onChange={(v) => updateArray("academicInfoList", item.id, "grade", v)} />
                  <Input label="Grade %" value={item.gradeInPercentage} onChange={(v) => updateArray("academicInfoList", item.id, "gradeInPercentage", v)} />
                </div>
              ))}
              <button type="button" className="add-btn" onClick={() => addItem("academicInfoList")}>
                + Add Academic
              </button>
            </Section>
          )}

          {stepKey === "work" && (
            <Section title="Work Experience" subtitle="Optional, but helps personalize offers.">
              {form.workExperienceList.map((item) => (
                <div key={item.id} className="signup-grid">
                  <Input label="Company" value={item.companyName} onChange={(v) => updateArray("workExperienceList", item.id, "companyName", v)} />
                  <Input label="Designation" value={item.designation} onChange={(v) => updateArray("workExperienceList", item.id, "designation", v)} />
                  <Input label="Start Date" type="date" value={item.startDate} onChange={(v) => updateArray("workExperienceList", item.id, "startDate", v)} />
                  <Input label="End Date" type="date" value={item.endDate} onChange={(v) => updateArray("workExperienceList", item.id, "endDate", v)} />
                  <Input label="CTC" value={item.ctc} onChange={(v) => updateArray("workExperienceList", item.id, "ctc", v)} />
                  <Input label="Reason For Leaving" value={item.reasonForLeaving} onChange={(v) => updateArray("workExperienceList", item.id, "reasonForLeaving", v)} />
                  <div className="field full">
                    <label className="checkbox-field">
                      <input
                        type="checkbox"
                        checked={item.currentlyWorking}
                        onChange={(e) => updateArray("workExperienceList", item.id, "currentlyWorking", e.target.checked)}
                      />
                      Currently Working
                    </label>
                  </div>
                </div>
              ))}
              <button type="button" className="add-btn" onClick={() => addItem("workExperienceList")}>
                + Add Work Experience
              </button>
            </Section>
          )}

          {stepKey === "govt" && (
            <Section title="Government Proof" subtitle="Required for secure access.">
              <div className="signup-grid">
                <div className="field">
                  <label>ID Type</label>
                  <select
                    value={form.govtProof.idType}
                    onChange={(e) => setForm((prev) => ({ ...prev, govtProof: { ...prev.govtProof, idType: e.target.value } }))}
                  >
                    <option value="">Select ID Type</option>
                    <option value="AADHAAR">Aadhaar</option>
                    <option value="PAN">PAN Card</option>
                    <option value="PASSPORT">Passport</option>
                    <option value="DL">Driving License</option>
                  </select>
                </div>

                <Input
                  label="ID Number"
                  value={form.govtProof.idNumber}
                  onChange={(v) => setForm((prev) => ({ ...prev, govtProof: { ...prev.govtProof, idNumber: v } }))}
                />

                <div className="field full">
                  <label>Upload ID Proof</label>
                  <input
                    type="file"
                    accept="image/*,.pdf"
                    onChange={(e) => {
                      const file = e.target.files[0];
                      if (!file) return;
                      const preview = file.type.startsWith("image/") ? URL.createObjectURL(file) : "";
                      const reader = new FileReader();
                      reader.onload = () => {
                        const dataUrl = typeof reader.result === "string" ? reader.result : "";
                        setForm((prev) => ({
                          ...prev,
                          govtProof: {
                            ...prev.govtProof,
                            file,
                            fileName: file.name,
                            fileType: file.type,
                            fileDataUrl: dataUrl,
                            filePreview: preview
                          }
                        }));
                      };
                      reader.readAsDataURL(file);
                    }}
                  />
                </div>

                {form.govtProof.filePreview && (
                  <div className="field full">
                    <label>Preview</label>
                    <img src={form.govtProof.filePreview} alt="ID Preview" className="upload-preview" />
                  </div>
                )}
              </div>
            </Section>
          )}
        </motion.div>
      </AnimatePresence>

      <div className="signup-actions">
        <button type="button" className="btn-back-neat" onClick={onBack} disabled={isFirst || loading}>
          Back
        </button>
        {isLast ? (
          <button type="button" className="primary-btn" onClick={handleSubmit} disabled={loading}>
            {loading ? "Creating..." : "Create User Account"}
          </button>
        ) : (
          <button type="button" className="primary-btn" onClick={handleNext} disabled={loading}>
            Next Step
          </button>
        )}
      </div>

      <p className="signup-helper">
        Already have an account? <Link to="/login">Login</Link>
      </p>
    </div>
  );
}

function OwnerSteps({ stepKey, onComplete, onNext, onBack, isFirst, isLast }) {
  const [form, setForm] = useState(defaultOwnerForm);
  const [loading, setLoading] = useState(false);
  const [uploading, setUploading] = useState(false);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");
  const days = ["MON", "TUE", "WED", "THU", "FRI", "SAT", "SUN"];

  const updateField = (field, value) => {
    setForm((prev) => ({ ...prev, [field]: value }));
  };

  const toggleDay = (day) => {
    setForm((prev) => {
      const exists = prev.workingDays.includes(day);
      const nextDays = exists
        ? prev.workingDays.filter((d) => d !== day)
        : [...prev.workingDays, day];
      return { ...prev, workingDays: nextDays };
    });
  };

  const toNumberOrNull = (value) => {
    if (value === "" || value === null || value === undefined) return null;
    const parsed = Number(value);
    return Number.isFinite(parsed) ? parsed : null;
  };

  const buildOwnerPayload = (values) => ({
    ...values,
    latitude: toNumberOrNull(values.latitude),
    longitude: toNumberOrNull(values.longitude),
    minOrderValue: toNumberOrNull(values.minOrderValue),
    prepTimeMinutes: toNumberOrNull(values.prepTimeMinutes)
  });

  const handleBrandingUpload = async (field, file) => {
    if (!file) return;
    try {
      setUploading(true);
      setError("");
      const response = await uploadCafeBrandingImageForSignup(file);
      const imageUrl = response?.imageUrl || "";
      if (!imageUrl) {
        throw new Error("Image upload failed.");
      }
      if (field === "galleryImages") {
        setForm((prev) => ({
          ...prev,
          galleryImages: [prev.galleryImages, imageUrl].filter(Boolean).join(",")
        }));
      } else {
        setForm((prev) => ({ ...prev, [field]: imageUrl }));
      }
    } catch (err) {
      setError(err.message || "Image upload failed.");
    } finally {
      setUploading(false);
    }
  };

  const handleNext = () => {
    try {
      setError("");
      validateOwnerStep(stepKey, form);
      onNext();
    } catch (err) {
      setError(err.message || "Please complete the required fields.");
    }
  };

  const handleSubmit = async () => {
    setLoading(true);
    setError("");
    setSuccess("");

    try {
      const payload = buildOwnerPayload(form);
      await registerCafeOwner(payload);
      setSuccess("Cafe owner registered successfully. You can log in now.");
      if (onComplete) {
        setTimeout(() => onComplete(), 800);
      }
    } catch (err) {
      setError(err.message || "Registration failed");
    } finally {
      setLoading(false);
    }
  };

  const galleryImages = (form.galleryImages || "")
    .split(",")
    .map((value) => value.trim())
    .filter(Boolean);

  return (
    <div className="signup-form">
      {error && <div className="error-bubble">{error}</div>}
      {success && <div className="success-bubble">{success}</div>}

      <AnimatePresence mode="wait">
        <motion.div
          key={stepKey}
          initial={{ opacity: 0, y: 12 }}
          animate={{ opacity: 1, y: 0 }}
          exit={{ opacity: 0, y: -12 }}
          transition={{ duration: 0.25 }}
        >
          {stepKey === "role" && (
            <Section title="Account Setup" subtitle="Create your owner login credentials.">
              <div className="signup-grid">
                <Input label="Email" type="email" value={form.email} onChange={(v) => updateField("email", v)} />
                <Input label="Password" type="password" value={form.password} onChange={(v) => updateField("password", v)} />
              </div>
            </Section>
          )}

          {stepKey === "owner" && (
            <Section title="Owner Details" subtitle="Who will manage this cafe?">
              <div className="signup-grid">
                <Input label="Owner Name" value={form.ownerName} onChange={(v) => updateField("ownerName", v)} />
                <Input label="Owner Phone" value={form.contactNumber} onChange={(v) => updateField("contactNumber", v)} />
              </div>
            </Section>
          )}

          {stepKey === "cafe" && (
            <Section title="Cafe Information" subtitle="Tell us about your cafe brand.">
              <div className="signup-grid">
                <Input label="Cafe Name" value={form.cafeName} onChange={(v) => updateField("cafeName", v)} />
                <Input label="Brand Name (optional)" value={form.brandName} onChange={(v) => updateField("brandName", v)} />
                <Input label="Description" value={form.description} onChange={(v) => updateField("description", v)} />
                <Select
                  label="Cafe Type"
                  value={form.cafeType}
                  onChange={(v) => updateField("cafeType", v)}
                  options={[
                    { value: "", label: "Select type" },
                    { value: "CAFE", label: "Cafe" },
                    { value: "RESTAURANT", label: "Restaurant" },
                    { value: "BAKERY", label: "Bakery" },
                    { value: "BEVERAGE_BAR", label: "Beverage Bar" }
                  ]}
                />
                <Input label="Opening Date (optional)" type="date" value={form.openingDate} onChange={(v) => updateField("openingDate", v)} />
              </div>
            </Section>
          )}

          {stepKey === "location" && (
            <Section title="Location & Contact" subtitle="Address and customer contact details.">
              <div className="signup-grid">
                <Input label="Street / Area" value={form.street} onChange={(v) => updateField("street", v)} />
                <Input label="Landmark (optional)" value={form.landmark} onChange={(v) => updateField("landmark", v)} />
                <Input label="City" value={form.city} onChange={(v) => updateField("city", v)} />
                <Input label="State" value={form.state} onChange={(v) => updateField("state", v)} />
                <Input label="Pincode" value={form.pincode} onChange={(v) => updateField("pincode", v)} />
                <Input label="Latitude (optional)" type="number" value={form.latitude} onChange={(v) => updateField("latitude", v)} />
                <Input label="Longitude (optional)" type="number" value={form.longitude} onChange={(v) => updateField("longitude", v)} />
              </div>
              <div className="signup-grid">
                <Input label="Cafe Contact Number" value={form.cafeContactNumber} onChange={(v) => updateField("cafeContactNumber", v)} />
                <Input label="Cafe Email" type="email" value={form.cafeEmail} onChange={(v) => updateField("cafeEmail", v)} />
                <Input label="WhatsApp Number (optional)" value={form.whatsappNumber} onChange={(v) => updateField("whatsappNumber", v)} />
              </div>
            </Section>
          )}

          {stepKey === "operations" && (
            <Section title="Operating Details" subtitle="Hours, working days, and services.">
              <div className="signup-grid">
                <Input label="Opening Time" type="time" value={form.openingTime} onChange={(v) => updateField("openingTime", v)} />
                <Input label="Closing Time" type="time" value={form.closingTime} onChange={(v) => updateField("closingTime", v)} />
              </div>
              <div className="signup-grid">
                <div className="field">
                  <label>Working Days</label>
                  <div className="pill-row">
                    {days.map((day) => (
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
              <div className="signup-grid">
                <label className="checkbox-field">
                  <input
                    type="checkbox"
                    checked={form.hasHomeDelivery}
                    onChange={(e) => updateField("hasHomeDelivery", e.target.checked)}
                  />
                  Delivery Available
                </label>
                <label className="checkbox-field">
                  <input
                    type="checkbox"
                    checked={form.hasTakeaway}
                    onChange={(e) => updateField("hasTakeaway", e.target.checked)}
                  />
                  Takeaway Available
                </label>
                <label className="checkbox-field">
                  <input
                    type="checkbox"
                    checked={form.hasDineIn}
                    onChange={(e) => updateField("hasDineIn", e.target.checked)}
                  />
                  Dine-in Available
                </label>
              </div>
            </Section>
          )}

          {stepKey === "documents" && (
            <Section title="Documents & Verification" subtitle="Documents needed for approval.">
              <div className="signup-grid">
                <Input label="FSSAI License Number" value={form.fssaiLicenseNumber} onChange={(v) => updateField("fssaiLicenseNumber", v)} />
                <Input label="GST Number (optional)" value={form.gstNumber} onChange={(v) => updateField("gstNumber", v)} />
                <div className="field">
                  <label>Shop Photo (optional)</label>
                  <input type="file" accept="image/*" onChange={(e) => handleBrandingUpload("shopPhotoUrl", e.target.files?.[0])} />
                  <small>{form.shopPhotoUrl ? "Photo added" : "Add photo (jpg/png/webp)"}</small>
                  {form.shopPhotoUrl && (
                    <img src={resolveMediaUrl(form.shopPhotoUrl)} alt="Shop" className="upload-preview signup-preview" />
                  )}
                </div>
                <div className="field">
                  <label>License Document (required)</label>
                  <input type="file" accept="image/*" onChange={(e) => handleBrandingUpload("licenseDocumentUrl", e.target.files?.[0])} />
                  <small>{form.licenseDocumentUrl ? "Document photo added" : "Upload license photo"}</small>
                  {form.licenseDocumentUrl && (
                    <img src={resolveMediaUrl(form.licenseDocumentUrl)} alt="License" className="upload-preview signup-preview" />
                  )}
                </div>
                <div className="field">
                  <label>Owner ID Proof (optional)</label>
                  <input type="file" accept="image/*" onChange={(e) => handleBrandingUpload("ownerIdProofUrl", e.target.files?.[0])} />
                  <small>{form.ownerIdProofUrl ? "ID proof added" : "Upload owner ID photo"}</small>
                  {form.ownerIdProofUrl && (
                    <img src={resolveMediaUrl(form.ownerIdProofUrl)} alt="Owner ID" className="upload-preview signup-preview" />
                  )}
                </div>
              </div>
              {uploading && <p className="field-uploading">Uploading image...</p>}
            </Section>
          )}

          {stepKey === "branding" && (
            <Section title="Images & Branding" subtitle="Add your cafe visuals.">
              <div className="signup-grid">
                <div className="field">
                  <label>Cafe Logo (optional)</label>
                  <input type="file" accept="image/*" onChange={(e) => handleBrandingUpload("cafeLogoUrl", e.target.files?.[0])} />
                  {form.cafeLogoUrl && (
                    <img src={resolveMediaUrl(form.cafeLogoUrl)} alt="Cafe logo" className="upload-preview signup-preview" />
                  )}
                </div>
                <div className="field">
                  <label>Cover Image (optional)</label>
                  <input type="file" accept="image/*" onChange={(e) => handleBrandingUpload("coverImageUrl", e.target.files?.[0])} />
                  {form.coverImageUrl && (
                    <img src={resolveMediaUrl(form.coverImageUrl)} alt="Cover" className="upload-preview signup-preview" />
                  )}
                </div>
                <div className="field">
                  <label>Gallery Images (optional)</label>
                  <input type="file" accept="image/*" onChange={(e) => handleBrandingUpload("galleryImages", e.target.files?.[0])} />
                  {galleryImages.length > 0 && (
                    <div className="signup-gallery-preview">
                      {galleryImages.map((imageUrl) => (
                        <img key={imageUrl} src={resolveMediaUrl(imageUrl)} alt="Gallery" className="upload-preview signup-preview-thumb" />
                      ))}
                    </div>
                  )}
                </div>
              </div>
              {uploading && <p className="field-uploading">Uploading image...</p>}
            </Section>
          )}

          {stepKey === "payments" && (
            <Section title="Payments & Settings" subtitle="Payment options and visibility controls.">
              <div className="signup-grid">
                <label className="checkbox-field">
                  <input
                    type="checkbox"
                    checked={form.acceptCash}
                    onChange={(e) => updateField("acceptCash", e.target.checked)}
                  />
                  Accept Cash
                </label>
              </div>
              <div className="signup-grid">
                <Input label="UPI ID (optional)" value={form.upiId} onChange={(v) => updateField("upiId", v)} />
                <Input label="Account Holder Name (optional)" value={form.accountHolderName} onChange={(v) => updateField("accountHolderName", v)} />
                <Input label="Account Number (optional)" value={form.accountNumber} onChange={(v) => updateField("accountNumber", v)} />
                <Input label="IFSC Code (optional)" value={form.ifscCode} onChange={(v) => updateField("ifscCode", v)} />
              </div>
              <div className="signup-grid">
                <label className="checkbox-field">
                  <input
                    type="checkbox"
                    checked={form.cafeVisible}
                    onChange={(e) => updateField("cafeVisible", e.target.checked)}
                  />
                  Cafe Visible
                </label>
              </div>
              <div className="signup-grid">
                <Input label="Minimum Order Value (optional)" type="number" value={form.minOrderValue} onChange={(v) => updateField("minOrderValue", v)} />
                <Input label="Preparation Time (mins)" type="number" value={form.prepTimeMinutes} onChange={(v) => updateField("prepTimeMinutes", v)} />
              </div>
            </Section>
          )}
        </motion.div>
      </AnimatePresence>

      <div className="signup-actions">
        <button type="button" className="btn-back-neat" onClick={onBack} disabled={isFirst || loading}>
          Back
        </button>
        {isLast ? (
          <button type="button" className="primary-btn" onClick={handleSubmit} disabled={loading || uploading}>
            {loading ? "Submitting..." : "Register Cafe Owner"}
          </button>
        ) : (
          <button type="button" className="primary-btn" onClick={handleNext} disabled={loading || uploading}>
            Next Step
          </button>
        )}
      </div>

      <p className="signup-helper">
        Already registered? <Link to="/cafe-owner/login">Owner Login</Link>
      </p>
    </div>
  );
}

function Section({ title, subtitle, children }) {
  return (
    <div className="signup-section">
      <div className="section-header">
        <h3>{title}</h3>
        {subtitle && <p>{subtitle}</p>}
      </div>
      {children}
    </div>
  );
}

function Input({ label, type = "text", value, onChange, className = "" }) {
  return (
    <div className={`field ${className}`}>
      <label>{label}</label>
      <input type={type} value={value || ""} onChange={(e) => onChange(e.target.value)} />
    </div>
  );
}

function Select({ label, value, onChange, options = [], className = "" }) {
  return (
    <div className={`field ${className}`}>
      <label>{label}</label>
      <select value={value || ""} onChange={(e) => onChange(e.target.value)}>
        {options.map((option) => (
          <option key={option.value} value={option.value}>
            {option.label}
          </option>
        ))}
      </select>
    </div>
  );
}

function buildCustomerPayload(form) {
  const academics = form.academicInfoList
    .filter((item) => item.institutionName?.trim() && item.degree?.trim())
    .map((item) => {
      const endYear = Number(item.passingYear);
      return {
        institution: item.institutionName.trim(),
        degree: item.degree.trim(),
        fieldOfStudy: item.grade?.trim() || null,
        startYear: null,
        endYear: Number.isFinite(endYear) ? endYear : null
      };
    });

  const workExperiences = form.workExperienceList
    .filter((item) => item.companyName?.trim() && item.designation?.trim())
    .map((item) => ({
      company: item.companyName.trim(),
      title: item.designation.trim(),
      startDate: item.startDate || null,
      endDate: item.currentlyWorking ? null : item.endDate || null,
      description: item.reasonForLeaving?.trim() || null
    }));

  return {
    email: form.personalDetails.email.trim(),
    password: form.password,
    profile: {
      firstName: form.personalDetails.firstName.trim(),
      lastName: form.personalDetails.lastName.trim(),
      dob: form.personalDetails.dob || null,
      gender: form.personalDetails.gender.trim(),
      contactNo: form.personalDetails.contactNo?.trim() || null,
      maritalStatus: form.personalDetails.maritalStatus?.trim() || null,
      street: form.address.street.trim(),
      plotNo: form.address.landmark.trim() || form.address.street.trim(),
      city: form.address.city.trim(),
      state: form.address.state?.trim() || null,
      pincode: form.address.pincode.trim(),
      country: form.address.country?.trim() || null,
      academics,
      workExperiences
    },
    govtProof: {
      idType: form.govtProof.idType.trim(),
      idNumber: form.govtProof.idNumber.trim(),
      fileName: form.govtProof.fileName || "id-proof",
      fileType: form.govtProof.fileType || "application/octet-stream",
      fileData: form.govtProof.fileDataUrl
    }
  };
}

function validateCustomerPayload(payload) {
  if (!payload.email || !payload.password) {
    throw new Error("Email and password are required.");
  }
  if (!payload.profile.firstName || !payload.profile.lastName || !payload.profile.dob || !payload.profile.gender) {
    throw new Error("Please complete your personal details.");
  }
  if (!payload.profile.street || !payload.profile.city || !payload.profile.pincode) {
    throw new Error("Please complete your address details.");
  }
  if (!payload.profile.academics || payload.profile.academics.length === 0) {
    throw new Error("Please add at least one academic record.");
  }
  if (!payload.govtProof.idType || !payload.govtProof.idNumber || !payload.govtProof.fileData) {
    throw new Error("Please upload government ID proof.");
  }
}

function validateCustomerStep(stepKey, form) {
  if (stepKey === "personal") {
    if (!form.personalDetails.firstName || !form.personalDetails.lastName || !form.personalDetails.dob) {
      throw new Error("Please complete your personal details.");
    }
  }
  if (stepKey === "address") {
    if (!form.address.street || !form.address.city || !form.address.pincode) {
      throw new Error("Please complete your address details.");
    }
  }
  if (stepKey === "academics") {
    const hasAcademic = form.academicInfoList.some((item) => item.institutionName && item.degree);
    if (!hasAcademic) {
      throw new Error("Add at least one academic record.");
    }
  }
  if (stepKey === "govt") {
    if (!form.govtProof.idType || !form.govtProof.idNumber || !form.govtProof.fileDataUrl) {
      throw new Error("Government ID proof is required.");
    }
  }
}

function validateOwnerStep(stepKey, form) {
  if (stepKey === "owner") {
    if (!form.ownerName || !form.contactNumber) {
      throw new Error("Please complete owner details.");
    }
  }
  if (stepKey === "cafe") {
    if (!form.cafeName || !form.cafeType) {
      throw new Error("Cafe name and type are required.");
    }
  }
  if (stepKey === "location") {
    if (!form.street || !form.city || !form.state || !form.pincode || !form.cafeContactNumber || !form.cafeEmail) {
      throw new Error("Please complete location and contact details.");
    }
  }
  if (stepKey === "operations") {
    if (!form.openingTime || !form.closingTime || form.workingDays.length === 0) {
      throw new Error("Working days and hours are required.");
    }
  }
  if (stepKey === "documents") {
    if (!form.fssaiLicenseNumber || !form.licenseDocumentUrl) {
      throw new Error("FSSAI and license document are required.");
    }
  }
}
