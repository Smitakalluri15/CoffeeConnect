// src/routes/AppRoutes.jsx
import { Routes, Route, Navigate, useLocation } from "react-router-dom";
import { AnimatePresence, motion } from "framer-motion";
import HomePage from "../pages/HomePage";
import LoginPage from "../pages/LoginPage";
import SignupPage from "../pages/SignupPage";
import ForgotPassword from "../pages/ForgotPassword";
import ResetPassword from "../pages/ResetPassword";
import Dashboard from "../pages/Dashboard";
import AdminDashboard from "../pages/AdminDashboard";
import ProfilePage from "../pages/ProfilePage";
import BookingPage from "../pages/BookingPage";
import CafeListingPage from "../pages/CafeListingPage";
import CafeProfilePage from "../pages/CafeProfilePage";
import CafeMenuPage from "../pages/CafeMenuPage";
import CartPage from "../pages/CartPage";
import CheckoutPage from "../pages/CheckoutPage";
import OrderConfirmationPage from "../pages/OrderConfirmationPage";
import OrderHistoryPage from "../pages/OrderHistoryPage";
import OrderReceiptPage from "../pages/OrderReceiptPage";
import ProtectedRoute from "./ProtectedRoute";
import { ROLES } from "../utils/constants";
import OwnerLayout from "../pages/owner/OwnerLayout";
import OwnerOverview from "../pages/owner/OwnerOverview";
import OwnerCafeProfile from "../pages/owner/OwnerCafeProfile";
import OwnerMenu from "../pages/owner/OwnerMenu";
import OwnerStaff from "../pages/owner/OwnerStaff";
import OwnerBookings from "../pages/owner/OwnerBookings";
import OwnerCompliance from "../pages/owner/OwnerCompliance";
import OwnerAnalytics from "../pages/owner/OwnerAnalytics";
import OwnerSettings from "../pages/owner/OwnerSettings";
import StaffDashboard from "../pages/staff/StaffDashboard";
import ChefMenuManager from "../pages/staff/ChefMenuManager";
import ShareBitePage from "../pages/ShareBitePage";

export default function AppRoutes() {
  const location = useLocation();

  return (
    <AnimatePresence mode="wait">
      <motion.div
        key={location.pathname}
        initial={{ opacity: 0, y: 12 }}
        animate={{ opacity: 1, y: 0 }}
        exit={{ opacity: 0, y: -10 }}
        transition={{ duration: 0.22, ease: "easeOut" }}
      >
        <Routes location={location}>
          <Route path="/" element={<HomePage />} />
          <Route path="/login" element={<LoginPage />} />
          <Route path="/signup" element={<SignupPage />} />
          <Route path="/cafe-owner/login" element={<LoginPage defaultRole="CAFE_OWNER" />} />
          <Route path="/cafe-owner/signup" element={<SignupPage defaultRole="CAFE_OWNER" />} />
          <Route path="/forgot-password" element={<ForgotPassword />} />
          <Route path="/reset-password" element={<ResetPassword />} />
          <Route path="/sharebite" element={<ShareBitePage />} />
          <Route path="/cafes" element={<CafeListingPage />} />
          <Route path="/cafes/:cafeId" element={<CafeProfilePage />} />
          <Route path="/cafes/:cafeId/menu" element={<CafeMenuPage />} />
          <Route path="/cart" element={<CartPage />} />

          <Route
            path="/dashboard"
            element={
              <ProtectedRoute>
                <Dashboard />
              </ProtectedRoute>
            }
          />

          <Route
            path="/owner"
            element={
              <ProtectedRoute allowedRoles={[ROLES.CAFE_OWNER]} redirectTo="/dashboard">
                <OwnerLayout />
              </ProtectedRoute>
            }
          >
            <Route index element={<OwnerOverview />} />
            <Route path="profile" element={<OwnerCafeProfile />} />
            <Route path="menu" element={<OwnerMenu />} />
            <Route path="staff" element={<OwnerStaff />} />
            <Route path="orders" element={<Navigate to="/owner/bookings" replace />} />
            <Route path="bookings" element={<OwnerBookings />} />
            <Route path="compliance" element={<OwnerCompliance />} />
            <Route path="analytics" element={<OwnerAnalytics />} />
            <Route path="settings" element={<OwnerSettings />} />
          </Route>

          <Route
            path="/staff"
            element={
              <ProtectedRoute allowedRoles={[ROLES.CHEF, ROLES.WAITER]} redirectTo="/dashboard">
                <StaffDashboard />
              </ProtectedRoute>
            }
          />
          <Route
            path="/staff/menu"
            element={
              <ProtectedRoute allowedRoles={[ROLES.CHEF]} redirectTo="/staff">
                <ChefMenuManager />
              </ProtectedRoute>
            }
          />

          <Route path="/owner-dashboard" element={<Navigate to="/owner" replace />} />

          <Route
            path="/profile"
            element={
              <ProtectedRoute>
                <ProfilePage />
              </ProtectedRoute>
            }
          />

          <Route
            path="/booking"
            element={
              <ProtectedRoute>
                <BookingPage />
              </ProtectedRoute>
            }
          />

          <Route
            path="/checkout"
            element={
              <ProtectedRoute allowedRoles={[ROLES.USER]} redirectTo="/dashboard">
                <CheckoutPage />
              </ProtectedRoute>
            }
          />

          <Route
            path="/orders"
            element={
              <ProtectedRoute allowedRoles={[ROLES.USER]} redirectTo="/dashboard">
                <OrderHistoryPage />
              </ProtectedRoute>
            }
          />

          <Route
            path="/orders/:orderId/confirmation"
            element={
              <ProtectedRoute allowedRoles={[ROLES.USER]} redirectTo="/dashboard">
                <OrderConfirmationPage />
              </ProtectedRoute>
            }
          />

          <Route
            path="/orders/:orderId/receipt"
            element={
              <ProtectedRoute allowedRoles={[ROLES.USER]} redirectTo="/dashboard">
                <OrderReceiptPage />
              </ProtectedRoute>
            }
          />

          <Route
            path="/admin"
            element={
              <ProtectedRoute allowedRoles={[ROLES.ADMIN]} redirectTo="/dashboard">
                <AdminDashboard />
              </ProtectedRoute>
            }
          />
        </Routes>
      </motion.div>
    </AnimatePresence>
  );
}
