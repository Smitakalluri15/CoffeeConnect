import { motion } from "framer-motion";
import {
  BadgeCheck,
  Bell,
  ChartNoAxesCombined,
  Coffee,
  Eye,
  Globe,
  Mail,
  ShieldAlert,
  UserRoundCheck,
  Users
} from "lucide-react";
import { useEffect, useMemo, useState } from "react";
import { Bar, Doughnut } from "react-chartjs-2";
import {
  ArcElement,
  BarElement,
  CategoryScale,
  Chart as ChartJS,
  Legend,
  LinearScale,
  Tooltip
} from "chart.js";
import { Navigate, useNavigate } from "react-router-dom";
import AnimatedCounter from "../components/ui/AnimatedCounter";
import PremiumButton from "../components/ui/PremiumButton";
import PremiumCard from "../components/ui/PremiumCard";
import PremiumModal from "../components/ui/PremiumModal";
import PremiumSkeleton from "../components/ui/PremiumSkeleton";
import {
  approveCafeOwner,
  approveUser,
  getAdminStats,
  getCafeOwnerById,
  getPendingCafeOwners,
  getPendingUsers,
  getUserProfile,
  getUsersActivity,
  resolveMediaUrl,
  rejectCafeOwner,
  rejectUser
} from "../api/api";
import { useAuth } from "../context/AuthContext";
import "./AdminDashboard.css";

ChartJS.register(CategoryScale, LinearScale, BarElement, ArcElement, Tooltip, Legend);

const REFRESH_MS = 15000;

export default function AdminDashboard() {
  const { token, user, loading, logout } = useAuth();
  const navigate = useNavigate();

  const [stats, setStats] = useState(null);
  const [statsLoading, setStatsLoading] = useState(true);
  const [pendingUsers, setPendingUsers] = useState([]);
  const [pendingOwners, setPendingOwners] = useState([]);
  const [activity, setActivity] = useState(null);
  const [error, setError] = useState("");

  const [profileLoading, setProfileLoading] = useState(false);
  const [selectedUser, setSelectedUser] = useState(null);
  const [selectedProfile, setSelectedProfile] = useState(null);

  const [ownerLoading, setOwnerLoading] = useState(false);
  const [selectedOwner, setSelectedOwner] = useState(null);
  const [ownerProfile, setOwnerProfile] = useState(null);

  const loadAll = async () => {
    if (!token) return;
    setError("");
    try {
      setStatsLoading(true);
      const [statsData, usersData, ownersData, activityData] = await Promise.all([
        getAdminStats(token),
        getPendingUsers(token),
        getPendingCafeOwners(token),
        getUsersActivity(token)
      ]);
      setStats(statsData);
      setPendingUsers(Array.isArray(usersData) ? usersData : []);
      setPendingOwners(Array.isArray(ownersData) ? ownersData : []);
      setActivity(activityData || null);
    } catch (err) {
      setError(err?.message || "Failed to load admin dashboard.");
    } finally {
      setStatsLoading(false);
    }
  };

  useEffect(() => {
    loadAll();
    const id = setInterval(loadAll, REFRESH_MS);
    return () => clearInterval(id);
  }, [token]);

  const activityData = useMemo(() => ({
    labels: activity?.labels || ["Mon", "Tue", "Wed", "Thu", "Fri", "Sat", "Sun"],
    datasets: [
      {
        label: "New users",
        data: activity?.newUsers || [2, 4, 3, 5, 7, 6, 8],
        backgroundColor: "#d08c55",
        borderRadius: 8
      },
      {
        label: "Returning users",
        data: activity?.returningUsers || [1, 2, 2, 3, 4, 4, 5],
        backgroundColor: "#523325",
        borderRadius: 8
      }
    ]
  }), [activity]);

  const activityOptions = useMemo(() => ({
    responsive: true,
    maintainAspectRatio: false,
    plugins: { legend: { position: "bottom" } },
    scales: {
      x: { grid: { display: false } },
      y: { beginAtZero: true, grid: { color: "rgba(86, 57, 39, 0.12)" } }
    }
  }), []);

  const splitChartData = useMemo(() => ({
    labels: ["Pending Users", "Pending Cafes", "Approved Users"],
    datasets: [
      {
        data: [pendingUsers.length, pendingOwners.length, Number(stats?.activeUsers) || 0],
        backgroundColor: ["#f2ad6f", "#8f5b3b", "#4a2b1d"]
      }
    ]
  }), [pendingOwners.length, pendingUsers.length, stats?.activeUsers]);

  const mapNodes = useMemo(() => (
    pendingOwners.slice(0, 5).map((ownerEntry, index) => ({
      id: ownerEntry.id,
      city: ownerEntry.city || `City ${index + 1}`,
      cafeName: ownerEntry.cafeName || "Cafe"
    }))
  ), [pendingOwners]);

  const handleOpenProfile = async (candidate) => {
    if (!candidate?.id) return;
    setSelectedUser(candidate);
    setSelectedProfile(null);
    setProfileLoading(true);
    try {
      const data = await getUserProfile(candidate.id, token);
      setSelectedProfile(data);
    } catch (err) {
      setError(err?.message || "Failed to load user profile.");
    } finally {
      setProfileLoading(false);
    }
  };

  const handleOpenOwner = async (candidate) => {
    if (!candidate?.id) return;
    setSelectedOwner(candidate);
    setOwnerProfile(null);
    setOwnerLoading(true);
    try {
      const data = await getCafeOwnerById(candidate.id, token);
      setOwnerProfile(data);
    } catch (err) {
      setError(err?.message || "Failed to load owner details.");
    } finally {
      setOwnerLoading(false);
    }
  };

  const removeUserFromPending = (id) => setPendingUsers((prev) => prev.filter((userEntry) => userEntry.id !== id));
  const removeOwnerFromPending = (id) => setPendingOwners((prev) => prev.filter((ownerEntry) => ownerEntry.id !== id));

  const handleApproveUser = async (id) => {
    try {
      await approveUser(id, token);
      removeUserFromPending(id);
      if (selectedUser?.id === id) setSelectedUser(null);
    } catch (err) {
      setError(err?.message || "Failed to approve user.");
    }
  };

  const handleRejectUser = async (id) => {
    const confirmed = window.confirm("Reject this user?");
    if (!confirmed) return;
    try {
      await rejectUser(id, token);
      removeUserFromPending(id);
      if (selectedUser?.id === id) setSelectedUser(null);
    } catch (err) {
      setError(err?.message || "Failed to reject user.");
    }
  };

  const handleApproveOwner = async (id) => {
    try {
      await approveCafeOwner(id, token);
      removeOwnerFromPending(id);
      if (selectedOwner?.id === id) setSelectedOwner(null);
    } catch (err) {
      setError(err?.message || "Failed to approve cafe owner.");
    }
  };

  const handleRejectOwner = async (id) => {
    const reason = window.prompt("Rejection reason (optional)");
    try {
      await rejectCafeOwner(id, reason || "", token);
      removeOwnerFromPending(id);
      if (selectedOwner?.id === id) setSelectedOwner(null);
    } catch (err) {
      setError(err?.message || "Failed to reject cafe owner.");
    }
  };

  if (loading) {
    return (
      <div className="admin-loading-shell">
        <PremiumSkeleton height={180} />
      </div>
    );
  }

  if (!token) return <Navigate to="/login" replace />;
  if (user?.role && user.role !== "ADMIN") return <Navigate to="/dashboard" replace />;

  return (
    <div className="admin-premium">
      <aside className="admin-side">
        <div className="admin-brand">
          <div className="admin-brand-mark"><Coffee size={16} /></div>
          <div>
            <strong>Admin Console</strong>
            <small>CoffeeConnect</small>
          </div>
        </div>

        <div className="admin-side-card">
          <span>Pending queue</span>
          <strong>{pendingUsers.length + pendingOwners.length}</strong>
          <small>Needs manual approval</small>
        </div>

        <nav className="admin-side-nav">
          <button type="button" className="active"><ChartNoAxesCombined size={15} /> Dashboard</button>
          <button type="button"><Users size={15} /> Users</button>
          <button type="button"><BadgeCheck size={15} /> Cafe Owners</button>
          <button type="button"><ShieldAlert size={15} /> Compliance</button>
        </nav>

        <PremiumButton variant="ghost" onClick={() => { logout(); navigate("/login"); }}>
          Sign Out
        </PremiumButton>
      </aside>

      <main className="admin-main-premium">
        <header className="admin-page-head">
          <div>
            <h1>Admin Dashboard</h1>
            <p>Live approval pipeline and operational insights.</p>
          </div>
          <div className="admin-head-icons">
            <span><Bell size={16} /> {pendingUsers.length + pendingOwners.length}</span>
            <span><Mail size={16} /> Inbox</span>
          </div>
        </header>

        {error && <div className="owner-alert">{error}</div>}

        <section className="admin-stat-grid">
          <PremiumCard className="admin-stat-card">
            <span>Total Users</span>
            <AnimatedCounter value={Number(stats?.totalUsers) || 0} />
          </PremiumCard>
          <PremiumCard className="admin-stat-card">
            <span>Active Users</span>
            <AnimatedCounter value={Number(stats?.activeUsers) || 0} />
          </PremiumCard>
          <PremiumCard className="admin-stat-card">
            <span>Pending User Approvals</span>
            <AnimatedCounter value={pendingUsers.length} />
          </PremiumCard>
          <PremiumCard className="admin-stat-card">
            <span>Pending Cafe Approvals</span>
            <AnimatedCounter value={pendingOwners.length} />
          </PremiumCard>
        </section>

        <section className="admin-grid-2">
          <PremiumCard className="panel" hover={false}>
            <div className="panel-header">
              <div>
                <h2>Signup Activity</h2>
                <p>New vs returning users.</p>
              </div>
            </div>
            {statsLoading ? (
              <PremiumSkeleton height={280} />
            ) : (
              <div style={{ height: 280 }}>
                <Bar data={activityData} options={activityOptions} />
              </div>
            )}
          </PremiumCard>

          <PremiumCard className="panel" hover={false}>
            <div className="panel-header">
              <div>
                <h2>Approval Split</h2>
                <p>Current queue composition.</p>
              </div>
            </div>
            {statsLoading ? (
              <PremiumSkeleton height={280} />
            ) : (
              <div style={{ height: 280 }}>
                <Doughnut data={splitChartData} />
              </div>
            )}
          </PremiumCard>
        </section>

        <section className="admin-grid-2">
          <PremiumCard className="panel" hover={false}>
            <div className="panel-header">
              <div>
                <h2>Pending Users</h2>
                <p>Approve or reject customer registrations.</p>
              </div>
            </div>
            <div className="admin-table">
              <div className="admin-table-head">
                <span>Email</span>
                <span>Actions</span>
              </div>
              {pendingUsers.length === 0 ? (
                <div className="owner-empty-inline">No pending users.</div>
              ) : (
                pendingUsers.map((entry) => (
                  <div key={entry.id} className="admin-table-row">
                    <span>{entry.email}</span>
                    <div className="table-actions">
                      <PremiumButton variant="ghost" onClick={() => handleOpenProfile(entry)}><Eye size={15} /> View</PremiumButton>
                      <PremiumButton variant="secondary" onClick={() => handleApproveUser(entry.id)}>Approve</PremiumButton>
                      <PremiumButton variant="danger" onClick={() => handleRejectUser(entry.id)}>Reject</PremiumButton>
                    </div>
                  </div>
                ))
              )}
            </div>
          </PremiumCard>

          <PremiumCard className="panel" hover={false}>
            <div className="panel-header">
              <div>
                <h2>Pending Cafe Owners</h2>
                <p>Review and approve cafe onboarding.</p>
              </div>
            </div>
            <div className="admin-table">
              <div className="admin-table-head">
                <span>Cafe</span>
                <span>Actions</span>
              </div>
              {pendingOwners.length === 0 ? (
                <div className="owner-empty-inline">No pending cafes.</div>
              ) : (
                pendingOwners.map((entry) => (
                  <div key={entry.id} className="admin-table-row">
                    <span>{entry.cafeName || "Cafe"} • {entry.ownerName || "Owner"}</span>
                    <div className="table-actions">
                      <PremiumButton variant="ghost" onClick={() => handleOpenOwner(entry)}><Eye size={15} /> View</PremiumButton>
                      <PremiumButton variant="secondary" onClick={() => handleApproveOwner(entry.id)}>Approve</PremiumButton>
                      <PremiumButton variant="danger" onClick={() => handleRejectOwner(entry.id)}>Reject</PremiumButton>
                    </div>
                  </div>
                ))
              )}
            </div>
          </PremiumCard>
        </section>

        <section>
          <PremiumCard className="panel admin-map-panel" hover={false}>
            <div className="panel-header">
              <div>
                <h2>City Signals</h2>
                <p>Pending cafe clusters by location.</p>
              </div>
            </div>
            <div className="admin-map">
              <div className="admin-map-glow"><Globe size={26} /></div>
              <div className="admin-map-list">
                {mapNodes.length === 0 ? (
                  <div className="owner-empty-inline">No location data yet.</div>
                ) : (
                  mapNodes.map((node, index) => (
                    <motion.div
                      key={node.id}
                      className="admin-map-node"
                      initial={{ opacity: 0, x: -10 }}
                      animate={{ opacity: 1, x: 0 }}
                      transition={{ delay: index * 0.05 }}
                    >
                      <strong>{node.city}</strong>
                      <span>{node.cafeName}</span>
                    </motion.div>
                  ))
                )}
              </div>
            </div>
          </PremiumCard>
        </section>
      </main>

      <PremiumModal
        open={Boolean(selectedUser)}
        title="User Profile Review"
        subtitle={selectedUser?.email}
        onClose={() => setSelectedUser(null)}
      >
        {profileLoading ? (
          <PremiumSkeleton height={180} />
        ) : selectedProfile ? (
          <div className="admin-review-stack">
            <section className="admin-modal-section">
              <h4>Personal Details</h4>
              <div className="admin-profile-grid">
                <Info label="First Name" value={selectedProfile.firstName} />
                <Info label="Last Name" value={selectedProfile.lastName} />
                <Info label="DOB" value={selectedProfile.dob} />
                <Info label="Gender" value={selectedProfile.gender} />
                <Info label="Contact" value={selectedProfile.contactNo} />
                <Info label="Marital Status" value={selectedProfile.maritalStatus} />
                <Info label="Completion" value={`${selectedProfile.completionPercent || 0}%`} />
              </div>
            </section>

            <section className="admin-modal-section">
              <h4>Address</h4>
              <div className="admin-profile-grid">
                <Info label="Street" value={selectedProfile.street} />
                <Info label="Plot No" value={selectedProfile.plotNo} />
                <Info label="City" value={selectedProfile.city} />
                <Info label="State" value={selectedProfile.state} />
                <Info label="Pincode" value={selectedProfile.pincode} />
                <Info label="Country" value={selectedProfile.country} />
              </div>
            </section>

            <section className="admin-modal-section">
              <h4>Academics</h4>
              {(selectedProfile.academics || []).length === 0 ? (
                <div className="owner-empty-inline">No academic records.</div>
              ) : (
                <div className="admin-list-stack">
                  {selectedProfile.academics.map((item, index) => (
                    <div key={item.id || `${item.institution}-${index}`} className="admin-list-card">
                      <strong>{item.institution || "--"}</strong>
                      <span>{item.degree || "--"} • {item.fieldOfStudy || "--"}</span>
                      <small>{item.startYear || "--"} - {item.endYear || "Present"}</small>
                    </div>
                  ))}
                </div>
              )}
            </section>

            <section className="admin-modal-section">
              <h4>Work Experience</h4>
              {(selectedProfile.workExperiences || []).length === 0 ? (
                <div className="owner-empty-inline">No work experience records.</div>
              ) : (
                <div className="admin-list-stack">
                  {selectedProfile.workExperiences.map((item, index) => (
                    <div key={item.id || `${item.company}-${index}`} className="admin-list-card">
                      <strong>{item.company || "--"}</strong>
                      <span>{item.title || "--"}</span>
                      <small>{item.startDate || "--"} - {item.endDate || "Present"}</small>
                      {item.description && <p>{item.description}</p>}
                    </div>
                  ))}
                </div>
              )}
            </section>

            <section className="admin-modal-section">
              <h4>Government ID</h4>
              {selectedProfile.govtProof ? (
                <div className="admin-review-stack">
                  <div className="admin-profile-grid">
                    <Info label="ID Type" value={selectedProfile.govtProof.idType} />
                    <Info label="ID Number" value={selectedProfile.govtProof.idNumber} />
                    <Info label="File Name" value={selectedProfile.govtProof.fileName} />
                  </div>
                  <DocumentPreview
                    label="ID Proof"
                    source={toDataSource(selectedProfile.govtProof.fileType, selectedProfile.govtProof.fileData)}
                    fileType={selectedProfile.govtProof.fileType}
                  />
                </div>
              ) : (
                <div className="owner-empty-inline">No government proof uploaded.</div>
              )}
            </section>
          </div>
        ) : (
          <div className="owner-empty-inline">No profile data found.</div>
        )}
        <div style={{ display: "flex", justifyContent: "flex-end", gap: 10 }}>
          <PremiumButton variant="secondary" onClick={() => selectedUser?.id && handleApproveUser(selectedUser.id)}>
            <UserRoundCheck size={15} /> Approve
          </PremiumButton>
          <PremiumButton variant="danger" onClick={() => selectedUser?.id && handleRejectUser(selectedUser.id)}>Reject</PremiumButton>
        </div>
      </PremiumModal>

      <PremiumModal
        open={Boolean(selectedOwner)}
        title="Cafe Owner Review"
        subtitle={selectedOwner?.cafeName}
        onClose={() => setSelectedOwner(null)}
      >
        {ownerLoading ? (
          <PremiumSkeleton height={180} />
        ) : ownerProfile ? (
          <div className="admin-review-stack">
            <section className="admin-modal-section">
              <h4>Cafe Summary</h4>
              <div className="admin-profile-grid">
                <Info label="Cafe Name" value={ownerProfile.cafeName} />
                <Info label="Brand Name" value={ownerProfile.brandName} />
                <Info label="Owner Name" value={ownerProfile.ownerName} />
                <Info label="Email" value={ownerProfile.email} />
                <Info label="Contact" value={ownerProfile.contactNumber} />
                <Info label="Cafe Type" value={ownerProfile.cafeType} />
                <Info label="City" value={ownerProfile.city} />
                <Info label="State" value={ownerProfile.state} />
                <Info label="Status" value={ownerProfile.status} />
                <Info label="Verification" value={ownerProfile.verificationStatus} />
                <Info label="FSSAI" value={ownerProfile.fssaiLicenseNumber} />
                <Info label="GST" value={ownerProfile.gstNumber} />
              </div>
            </section>

            <section className="admin-modal-section">
              <h4>Uploaded Documents</h4>
              <div className="admin-doc-grid">
                <DocumentPreview
                  label="License Document"
                  source={resolveMediaUrl(ownerProfile.licenseDocumentUrl)}
                  fileType=""
                />
                <DocumentPreview
                  label="Shop Photo"
                  source={resolveMediaUrl(ownerProfile.shopPhotoUrl)}
                  fileType=""
                />
                <DocumentPreview
                  label="Owner ID Proof"
                  source={resolveMediaUrl(ownerProfile.ownerIdProofUrl)}
                  fileType=""
                />
              </div>
            </section>
          </div>
        ) : (
          <div className="owner-empty-inline">No owner details found.</div>
        )}
        <div style={{ display: "flex", justifyContent: "flex-end", gap: 10 }}>
          <PremiumButton variant="secondary" onClick={() => selectedOwner?.id && handleApproveOwner(selectedOwner.id)}>
            Approve
          </PremiumButton>
          <PremiumButton variant="danger" onClick={() => selectedOwner?.id && handleRejectOwner(selectedOwner.id)}>Reject</PremiumButton>
        </div>
      </PremiumModal>
    </div>
  );
}

function Info({ label, value }) {
  return (
    <div className="admin-profile-row">
      <span>{label}</span>
      <strong>{value || "--"}</strong>
    </div>
  );
}

function DocumentPreview({ label, source, fileType }) {
  const hasSource = Boolean(source);
  const lowerType = (fileType || "").toLowerCase();
  const lowerSource = (source || "").toLowerCase();
  const isPdf = lowerType.includes("pdf") || lowerSource.includes(".pdf");
  const isImage = lowerType.startsWith("image/") || /\.(png|jpe?g|webp|gif|bmp|svg|avif)(\?|$)/i.test(lowerSource) || lowerSource.startsWith("data:image/");

  return (
    <article className="admin-doc-card">
      <header className="admin-doc-head">
        <strong>{label}</strong>
        {hasSource && (
          <a href={source} target="_blank" rel="noreferrer">
            Open
          </a>
        )}
      </header>

      {!hasSource && <div className="admin-doc-empty">Not uploaded</div>}

      {hasSource && isPdf && (
        <iframe title={label} src={source} className="admin-doc-frame" />
      )}

      {hasSource && !isPdf && isImage && (
        <img className="admin-doc-image" src={source} alt={label} />
      )}

      {hasSource && !isPdf && !isImage && (
        <div className="admin-doc-empty">Preview unavailable for this file type.</div>
      )}
    </article>
  );
}

function toDataSource(fileType, fileData) {
  if (!fileType || !fileData) return "";
  return `data:${fileType};base64,${fileData}`;
}
