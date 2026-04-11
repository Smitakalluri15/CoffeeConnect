import { motion } from "framer-motion";
import { CalendarDays, NotebookTabs, Store, UsersRound } from "lucide-react";
import { useEffect, useMemo, useState } from "react";
import { useNavigate, useOutletContext } from "react-router-dom";
import AnimatedCounter from "../../components/ui/AnimatedCounter";
import PremiumButton from "../../components/ui/PremiumButton";
import PremiumCard from "../../components/ui/PremiumCard";
import { getOwnerBookings, getOwnerMenuCategories, getOwnerStaff, updateCafeVisibility } from "../../api/api";

const fadeInUp = {
  initial: { opacity: 0, y: 16 },
  whileInView: { opacity: 1, y: 0 },
  viewport: { once: true, amount: 0.3 },
  transition: { duration: 0.28, ease: "easeOut" }
};

export default function OwnerOverview() {
  const { owner, reloadOwner, token } = useOutletContext();
  const navigate = useNavigate();
  const [menuCategories, setMenuCategories] = useState([]);
  const [menuLoading, setMenuLoading] = useState(true);
  const [menuError, setMenuError] = useState("");
  const [staffMembers, setStaffMembers] = useState([]);
  const [bookings, setBookings] = useState([]);
  const [opsLoading, setOpsLoading] = useState(true);
  const [opsError, setOpsError] = useState("");
  const [visibilityLoading, setVisibilityLoading] = useState(false);

  const isApproved = owner?.status === "ACTIVE";

  useEffect(() => {
    if (!isApproved) {
      setMenuCategories([]);
      setMenuLoading(false);
      return;
    }

    const loadMenu = async () => {
      setMenuLoading(true);
      setMenuError("");
      try {
        const data = await getOwnerMenuCategories(token);
        setMenuCategories(Array.isArray(data) ? data : []);
      } catch (err) {
        setMenuError(err?.message || "Failed to load menu.");
      } finally {
        setMenuLoading(false);
      }
    };

    loadMenu();
  }, [isApproved, token]);

  useEffect(() => {
    if (!isApproved) {
      setStaffMembers([]);
      setBookings([]);
      setOpsLoading(false);
      return;
    }

    const loadOperations = async () => {
      setOpsLoading(true);
      setOpsError("");
      try {
        const [staffData, bookingData] = await Promise.all([getOwnerStaff(token), getOwnerBookings(token)]);
        setStaffMembers(Array.isArray(staffData) ? staffData : []);
        setBookings(Array.isArray(bookingData) ? bookingData : []);
      } catch (err) {
        setOpsError(err?.message || "Failed to load operations overview.");
      } finally {
        setOpsLoading(false);
      }
    };

    loadOperations();
  }, [isApproved, token]);

  const metrics = useMemo(() => {
    const todayIso = new Date().toISOString().slice(0, 10);
    const itemCount = menuCategories.reduce((total, category) => total + (category.items?.length || 0), 0);
    const activeItemCount = menuCategories.reduce(
      (total, category) => total + (category.items?.filter((item) => item.available).length || 0),
      0
    );
    const chefCount = staffMembers.filter((member) => member.role === "CHEF").length;
    const waiterCount = staffMembers.filter((member) => member.role === "WAITER").length;
    const activeStaffCount = staffMembers.filter((member) => member.status === "ACTIVE").length;
    const todayBookings = bookings.filter((booking) => booking.bookingDate === todayIso).length;
    const pendingBookings = bookings.filter((booking) => booking.status === "NEW" || booking.status === "CONFIRMED").length;
    return { itemCount, activeItemCount, chefCount, waiterCount, activeStaffCount, todayBookings, pendingBookings };
  }, [menuCategories, staffMembers, bookings]);

  const focusItems = useMemo(() => {
    const items = [];
    if (metrics.pendingBookings > 0) {
      items.push(`${metrics.pendingBookings} booking requests need action.`);
    }
    if (metrics.activeStaffCount === 0) {
      items.push("No active staff members. Activate at least one chef/waiter.");
    }
    if (metrics.activeItemCount === 0) {
      items.push("Menu has no active items. Publish items to accept more bookings.");
    }
    if (!owner?.cafeVisible) {
      items.push("Cafe is hidden. Switch visibility to start receiving customers.");
    }
    if (items.length === 0) {
      items.push("Operations look healthy right now.");
    }
    return items;
  }, [metrics, owner?.cafeVisible]);

  const handleVisibility = async () => {
    if (!isApproved || visibilityLoading) return;
    try {
      setVisibilityLoading(true);
      await updateCafeVisibility(!owner.cafeVisible, token);
      await reloadOwner();
    } catch (err) {
      setMenuError(err?.message || "Failed to update visibility");
    } finally {
      setVisibilityLoading(false);
    }
  };

  return (
    <div className="owner-page">
      {owner?.status === "PENDING" && (
        <div className="status-banner pending">Approval in progress. Admin will review your cafe details shortly.</div>
      )}
      {owner?.status === "REJECTED" && (
        <div className="status-banner rejected">Rejected: {owner.rejectionReason || "Please update profile and compliance."}</div>
      )}
      {owner?.status === "ACTIVE" && (
        <div className="status-banner live">
          Cafe live and visible to customers
          <button
            type="button"
            className={`toggle-btn ${owner.cafeVisible ? "on" : "off"}`}
            onClick={handleVisibility}
            disabled={visibilityLoading}
          >
            {owner.cafeVisible ? "Visible" : "Hidden"}
          </button>
        </div>
      )}

      <motion.section {...fadeInUp}>
        <PremiumCard className="panel" hover={false}>
          <div className="panel-header">
            <div>
              <h2>Quick Actions</h2>
              <p>Fast actions to run your cafe operations.</p>
            </div>
          </div>
          <div className="action-row">
            <PremiumButton variant="secondary" onClick={() => navigate("/owner/menu")}>
              <NotebookTabs size={15} /> Add Menu Item
            </PremiumButton>
            <PremiumButton variant="secondary" onClick={() => navigate("/owner/staff")}>
              <UsersRound size={15} /> Add Staff
            </PremiumButton>
            <PremiumButton variant="secondary" onClick={() => navigate("/owner/bookings")}>
              <CalendarDays size={15} /> View Today&apos;s Bookings
            </PremiumButton>
            <PremiumButton variant="secondary" onClick={() => navigate("/owner/profile")}>
              <Store size={15} /> Update Cafe Details
            </PremiumButton>
          </div>
        </PremiumCard>
      </motion.section>

      <motion.section {...fadeInUp} className="summary-grid">
        <PremiumCard className="summary-card">
          <span>Today&apos;s Bookings</span>
          <AnimatedCounter value={opsLoading ? 0 : metrics.todayBookings} />
        </PremiumCard>
        <PremiumCard className="summary-card">
          <span>Pending Requests</span>
          <AnimatedCounter value={opsLoading ? 0 : metrics.pendingBookings} />
        </PremiumCard>
        <PremiumCard className="summary-card">
          <span>Active Team Members</span>
          <AnimatedCounter value={opsLoading ? 0 : metrics.activeStaffCount} />
        </PremiumCard>
        <PremiumCard className="summary-card">
          <span>Active Menu Items</span>
          <AnimatedCounter value={menuLoading ? 0 : metrics.activeItemCount} />
        </PremiumCard>
        <PremiumCard className="summary-card">
          <span>Chefs</span>
          <AnimatedCounter value={opsLoading ? 0 : metrics.chefCount} />
        </PremiumCard>
        <PremiumCard className="summary-card">
          <span>Waiters</span>
          <AnimatedCounter value={opsLoading ? 0 : metrics.waiterCount} />
        </PremiumCard>
        <PremiumCard className="summary-card">
          <span>Total Menu Items</span>
          <AnimatedCounter value={menuLoading ? 0 : metrics.itemCount} />
        </PremiumCard>
      </motion.section>

      <motion.section {...fadeInUp} className="owner-extra-grid">
        <PremiumCard className="panel" hover={false}>
          <div className="panel-header">
            <div>
              <h2>Service Modes</h2>
              <p>What customers can access right now.</p>
            </div>
          </div>
          <div className="ops-chip-row">
            <span className={`ops-chip ${owner?.hasDineIn ? "on" : "off"}`}>Dine-In</span>
            <span className={`ops-chip ${owner?.hasTakeaway ? "on" : "off"}`}>Takeaway</span>
            <span className={`ops-chip ${owner?.hasHomeDelivery ? "on" : "off"}`}>Delivery</span>
            <span className={`ops-chip ${owner?.openNow ? "on" : "off"}`}>{owner?.openNow ? "Open Now" : "Closed Now"}</span>
          </div>
          <div className="ops-meta-grid">
            <div className="detail-item">
              <span>Operating Hours</span>
              <strong>{owner?.openingTime?.slice(0, 5) || "--"} to {owner?.closingTime?.slice(0, 5) || "--"}</strong>
            </div>
            <div className="detail-item">
              <span>Working Days</span>
              <strong>{owner?.workingDays?.length ? owner.workingDays.join(", ") : "--"}</strong>
            </div>
            <div className="detail-item">
              <span>Prep Time</span>
              <strong>{owner?.prepTimeMinutes ? `${owner.prepTimeMinutes} mins` : "--"}</strong>
            </div>
            <div className="detail-item">
              <span>Minimum Order</span>
              <strong>{owner?.minOrderValue ? `₹${owner.minOrderValue}` : "--"}</strong>
            </div>
          </div>
        </PremiumCard>

        <PremiumCard className="panel" hover={false}>
          <div className="panel-header">
            <div>
              <h2>Focus Queue</h2>
              <p>Priority tasks to keep operations smooth.</p>
            </div>
          </div>
          {opsLoading ? (
            <div className="owner-state">Loading operational focus...</div>
          ) : (
            <div className="focus-list">
              {focusItems.map((item) => (
                <div key={item} className="focus-item">{item}</div>
              ))}
            </div>
          )}
        </PremiumCard>
      </motion.section>

      {(menuError || opsError) && <div className="owner-alert">{menuError || opsError}</div>}

      {!menuLoading && menuCategories.length === 0 && isApproved && (
        <motion.section {...fadeInUp}>
          <PremiumCard className="empty-card" hover={false}>
            <div className="premium-empty-illustration" />
            <h3>Add your first category and menu item</h3>
            <p>Complete your menu to start receiving booking requests from customers.</p>
            <PremiumButton onClick={() => navigate("/owner/menu")}>Open Menu</PremiumButton>
          </PremiumCard>
        </motion.section>
      )}

      {!isApproved && (
        <div className="info-note">Menu, staff and booking controls will be fully unlocked after admin approval.</div>
      )}
    </div>
  );
}
