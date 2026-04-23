import { Routes, Route } from "react-router-dom";
import Dashboard from "../pages/admin/Dashboard";
import UserManagementPage from "../pages/admin/UserManagementPage";
import AppointmentRequest from "../pages/admin/AppointmentRequest";
import InventoryManagement from "../pages/admin/InventoryManagement";
import ReviewedAppointments from "../pages/admin/ReviewedAppointments";
import CreateGenerator from "../pages/admin/CreateGen";
import CreatePart from "../pages/admin/CreatePart";
import ReviewManagement from "../pages/admin/ReviewManagement";
import QuoteRequests from "../pages/admin/QuoteRequests";
import EditPageContent from "../pages/admin/EditPageContent";
import PartsRequest from "../pages/admin/PartsRequest.tsx";
import WaveInvoice from "../pages/admin/waveInvoice";
import ReviewReturns from "../pages/admin/ReviewReturns.tsx"

const AdminRoutes = () => (
  <Routes>
    {/* Change path="/" to path="/dashboard" 
       This ensures that "/admin/dashboard" renders the Dashboard component.
    */}
    <Route path="/dashboard" element={<Dashboard />} />

    <Route path="/user-management" element={<UserManagementPage />} />
    <Route path="/incoming/appointments" element={<AppointmentRequest />} />
    <Route path="/incoming/parts" element={<PartsRequest />} />
    <Route path="/inven-management" element={<InventoryManagement />} />
    <Route path="/reviewed" element={<ReviewedAppointments />} />
    <Route path="/create-gen" element={<CreateGenerator />} />
    <Route path="/incoming/quotes" element={<QuoteRequests />} />
    <Route path="/create-part" element={<CreatePart />} />
    <Route path="/review-management" element={<ReviewManagement />} />
    <Route path="/edit-about" element={<EditPageContent />} />
    <Route path="/wave-invoice" element={<WaveInvoice />} />
    <Route path="incoming/returns" element={<ReviewReturns />} />

    {/* Optional: Redirect any unknown /admin/ URLs back to the dashboard */}
    <Route path="*" element={<Dashboard />} />
  </Routes>
);
export default AdminRoutes;