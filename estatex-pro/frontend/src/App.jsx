import { Routes, Route } from 'react-router-dom'
import { AuthProvider } from './context/AuthContext'
import { ProtectedRoute, GuestRoute } from './components/common/ProtectedRoute'
import DashboardLayout from './components/layout/DashboardLayout'

// Public
import HomePage         from './pages/HomePage'
import LoginPage        from './pages/auth/LoginPage'
import RegisterPage     from './pages/auth/RegisterPage'
import PropertiesPage   from './pages/properties/PropertiesPage'
import PropertyDetailPage from './pages/properties/PropertyDetailPage'
import NotFoundPage     from './pages/NotFoundPage'

// Admin
import AdminDashboard   from './pages/admin/AdminDashboard'
import AdminUsers       from './pages/admin/AdminUsers'
import AdminProperties  from './pages/admin/AdminProperties'
import AdminBookings    from './pages/admin/AdminBookings'
import AdminAnalytics   from './pages/admin/AdminAnalytics'
import AdminReports     from './pages/admin/AdminReports'

// Agent
import AgentDashboard   from './pages/agent/AgentDashboard'
import AgentListings    from './pages/agent/AgentListings'
import AddPropertyPage  from './pages/agent/AddPropertyPage'
import AgentRequests    from './pages/agent/AgentRequests'
import AgentAnalytics   from './pages/agent/AgentAnalytics'

// Customer
import CustomerDashboard from './pages/customer/CustomerDashboard'
import { SavedProperties } from './pages/customer/SavedProperties'
import CustomerBookings  from './pages/customer/CustomerBookings'
import CustomerMessages  from './pages/customer/CustomerMessages'
import ProfileSettings   from './pages/customer/ProfileSettings'

const ADMIN_ROLES = ['super_admin', 'admin']
const AGENT_ROLES = ['agent', 'property_manager', 'admin', 'super_admin']

export default function App() {
  return (
    <AuthProvider>
      <Routes>
        {/* ── Public ── */}
        <Route path="/"               element={<HomePage />} />
        <Route path="/properties"     element={<PropertiesPage />} />
        <Route path="/properties/:id" element={<PropertyDetailPage />} />
        <Route path="/login"          element={<GuestRoute><LoginPage /></GuestRoute>} />
        <Route path="/register"       element={<GuestRoute><RegisterPage /></GuestRoute>} />

        {/* ── Admin ── */}
        <Route path="/dashboard/admin"
          element={<ProtectedRoute roles={ADMIN_ROLES}><DashboardLayout /></ProtectedRoute>}>
          <Route index            element={<AdminDashboard />} />
          <Route path="users"     element={<AdminUsers />} />
          <Route path="properties"element={<AdminProperties />} />
          <Route path="bookings"  element={<AdminBookings />} />
          <Route path="analytics" element={<AdminAnalytics />} />
          <Route path="reports"   element={<AdminReports />} />
        </Route>

        {/* ── Agent ── */}
        <Route path="/dashboard/agent"
          element={<ProtectedRoute roles={AGENT_ROLES}><DashboardLayout /></ProtectedRoute>}>
          <Route index                      element={<AgentDashboard />} />
          <Route path="listings"            element={<AgentListings />} />
          <Route path="add-property"        element={<AddPropertyPage />} />
          <Route path="edit-property/:id"   element={<AddPropertyPage />} />
          <Route path="requests"            element={<AgentRequests />} />
          <Route path="analytics"           element={<AgentAnalytics />} />
        </Route>

        {/* ── Customer ── */}
        <Route path="/dashboard/customer"
          element={<ProtectedRoute><DashboardLayout /></ProtectedRoute>}>
          <Route index             element={<CustomerDashboard />} />
          <Route path="saved"      element={<SavedProperties />} />
          <Route path="bookings"   element={<CustomerBookings />} />
          <Route path="messages"   element={<CustomerMessages />} />
          <Route path="profile"    element={<ProfileSettings />} />
        </Route>

        {/* ── 404 ── */}
        <Route path="*" element={<NotFoundPage />} />
      </Routes>
    </AuthProvider>
  )
}
