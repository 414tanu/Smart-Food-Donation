import { useContext } from 'react';
import { Link } from 'react-router-dom';
import AuthContext from '../context/AuthContext';
import { PackagePlus, Heart, ListOrdered, Map, UserCog, Settings } from 'lucide-react';

const Dashboard = () => {
  const { user } = useContext(AuthContext);

  const renderDonorDashboard = () => (
    <div className="grid md:grid-cols-2 gap-6">
      <Link to="/post-donation" className="bg-white p-6 rounded-xl shadow-sm border border-gray-100 hover:shadow-md transition-shadow flex items-center gap-4 group">
        <div className="bg-green-100 p-4 rounded-lg group-hover:bg-green-200 transition-colors">
          <PackagePlus className="w-8 h-8 text-green-600" />
        </div>
        <div>
          <h3 className="text-xl font-bold text-gray-800">Donate Food</h3>
          <p className="text-gray-500">Post surplus food for nearby NGOs</p>
        </div>
      </Link>
      
      <Link to="/my-donations" className="bg-white p-6 rounded-xl shadow-sm border border-gray-100 hover:shadow-md transition-shadow flex items-center gap-4 group">
        <div className="bg-orange-100 p-4 rounded-lg group-hover:bg-orange-200 transition-colors">
          <ListOrdered className="w-8 h-8 text-orange-600" />
        </div>
        <div>
          <h3 className="text-xl font-bold text-gray-800">My Donations</h3>
          <p className="text-gray-500">Track and manage your postings</p>
        </div>
      </Link>
    </div>
  );

  const renderNGODashboard = () => (
    <div className="grid md:grid-cols-2 gap-6">
      <Link to="/map-view" className="bg-white p-6 rounded-xl shadow-sm border border-gray-100 hover:shadow-md transition-shadow flex items-center gap-4 group">
        <div className="bg-blue-100 p-4 rounded-lg group-hover:bg-blue-200 transition-colors">
          <Map className="w-8 h-8 text-blue-600" />
        </div>
        <div>
          <h3 className="text-xl font-bold text-gray-800">Live Map</h3>
          <p className="text-gray-500">Find and claim nearby food donations</p>
        </div>
      </Link>
      
      <Link to="/my-pickups" className="bg-white p-6 rounded-xl shadow-sm border border-gray-100 hover:shadow-md transition-shadow flex items-center gap-4 group">
        <div className="bg-gray-100 p-4 rounded-lg group-hover:bg-gray-200 transition-colors">
          <Heart className="w-8 h-8 text-gray-600" />
        </div>
        <div>
          <h3 className="text-xl font-bold text-gray-800">My Pickups</h3>
          <p className="text-gray-500">Manage and verify your active collections</p>
        </div>
      </Link>
    </div>
  );

  const renderAdminDashboard = () => (
    <div className="grid md:grid-cols-2 gap-6">
      <Link to="/admin" className="bg-white p-6 rounded-xl shadow-sm border border-gray-100 hover:shadow-md transition-shadow flex items-center gap-4 group">
        <div className="bg-purple-100 p-4 rounded-lg group-hover:bg-purple-200 transition-colors">
          <Settings className="w-8 h-8 text-purple-600" />
        </div>
        <div>
          <h3 className="text-xl font-bold text-gray-800">Admin Panel</h3>
          <p className="text-gray-500">Manage users and platform settings</p>
        </div>
      </Link>
    </div>
  );

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10">
      <div className="mb-8 border-b pb-6">
        <h1 className="text-3xl font-bold text-gray-900">Dashboard</h1>
        <p className="text-gray-600 mt-2">Welcome back, {user?.name}! ({user?.role})</p>
      </div>
      
      {user?.role === 'donor' && renderDonorDashboard()}
      {user?.role === 'ngo' && renderNGODashboard()}
      {user?.role === 'admin' && renderAdminDashboard()}
    </div>
  );
};

export default Dashboard;
