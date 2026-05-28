import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import Navbar from './components/Navbar';
import BackButton from './components/BackButton';
import Home from './pages/Home';
import Login from './pages/Login';
import Register from './pages/Register';
import Dashboard from './pages/Dashboard';
import PostDonation from './pages/PostDonation';
import MyDonations from './pages/MyDonations';
import MapView from './pages/MapView';
import AdminPanel from './pages/AdminPanel';
import ProtectedRoute from './components/ProtectedRoute';
import ExpiryAlertNotifications from './components/ExpiryAlertNotifications';

function App() {
  return (
    <Router>
      <div className="min-h-screen flex flex-col font-sans text-gray-800 bg-gray-50">
        <Navbar />
        <BackButton />
        <ExpiryAlertNotifications />
        <main className="flex-grow">
          <Routes>
            <Route path="/" element={<Home />} />
            <Route path="/login" element={<Login />} />
            <Route path="/register" element={<Register />} />
            
            {/* Protected Routes */}
            <Route path="/dashboard" element={
              <ProtectedRoute>
                <Dashboard />
              </ProtectedRoute>
            } />
            
            {/* Donor Routes */}
            <Route path="/post-donation" element={
              <ProtectedRoute allowedRoles={['donor']}>
                <PostDonation />
              </ProtectedRoute>
            } />
            <Route path="/my-donations" element={
              <ProtectedRoute allowedRoles={['donor']}>
                <MyDonations />
              </ProtectedRoute>
            } />
            
            {/* NGO Routes */}
            <Route path="/map-view" element={
              <ProtectedRoute allowedRoles={['ngo']}>
                <MapView />
              </ProtectedRoute>
            } />
            
            {/* Admin Routes */}
            <Route path="/admin" element={
              <ProtectedRoute allowedRoles={['admin']}>
                <AdminPanel />
              </ProtectedRoute>
            } />
          </Routes>
        </main>
      </div>
    </Router>
  );
}

export default App;
