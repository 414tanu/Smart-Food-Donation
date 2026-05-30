import { useState, useEffect } from 'react';
import api from '../api/axios';
import { toast } from 'react-toastify';
import { Trash2, Clock, CheckCircle, Package, Leaf, Utensils, ShieldCheck, Key } from 'lucide-react';
import ImpactCard from '../components/ImpactCard';

const MyDonations = () => {
  const [donations, setDonations] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchDonations();
  }, []);

  const fetchDonations = async () => {
    try {
      const res = await api.get('/donations/my-donations');
      setDonations(res.data);
    } catch (error) {
      toast.error('Failed to fetch donations');
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = async (id) => {
    if (window.confirm('Are you sure you want to delete this donation?')) {
      try {
        await api.delete(`/donations/${id}`);
        setDonations(donations.filter(d => d._id !== id));
        toast.success('Donation deleted');
      } catch (error) {
        toast.error('Failed to delete donation');
      }
    }
  };

  const getStatusBadge = (status) => {
    switch(status) {
      case 'pending': return <span className="px-3 py-1 bg-yellow-100 text-yellow-800 rounded-full text-xs font-medium border border-yellow-200">Pending</span>;
      case 'accepted': return <span className="px-3 py-1 bg-blue-100 text-blue-800 rounded-full text-xs font-medium border border-blue-200">Accepted</span>;
      case 'collected': return <span className="px-3 py-1 bg-green-100 text-green-800 rounded-full text-xs font-medium border border-green-200">Collected</span>;
      case 'delivered': return <span className="px-3 py-1 bg-green-100 text-green-800 rounded-full text-xs font-medium border border-green-200">Delivered</span>;
      case 'expired': return <span className="px-3 py-1 bg-red-100 text-red-800 rounded-full text-xs font-medium border border-red-200">Expired</span>;
      default: return null;
    }
  };

  if (loading) return <div className="text-center py-10">Loading...</div>;

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10">
      <h1 className="text-2xl font-bold text-gray-900 mb-6">My Donations</h1>
      
      {donations.length === 0 ? (
        <div className="text-center py-20 bg-white rounded-2xl border border-gray-100 shadow-sm">
          <Package className="w-16 h-16 text-gray-300 mx-auto mb-4" />
          <h3 className="text-lg font-medium text-gray-900">No donations yet</h3>
          <p className="text-gray-500 mt-1">You haven't posted any food donations.</p>
        </div>
      ) : (
        <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
          {donations.map(donation => (
            <div key={donation._id} className="bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden flex flex-col hover:shadow-md transition-shadow">
              {donation.imageUrl ? (
                <img src={donation.imageUrl} alt={donation.foodName} className="h-48 w-full object-cover" />
              ) : (
                <div className="h-48 bg-gray-100 flex items-center justify-center">
                  <Package className="w-12 h-12 text-gray-300" />
                </div>
              )}
              
              <div className="p-5 flex-grow flex flex-col">
                <div className="flex justify-between items-start mb-2">
                  <h3 className="text-lg font-bold text-gray-900 line-clamp-1">{donation.foodName}</h3>
                  {getStatusBadge(donation.status)}
                </div>
                
                <p className="text-sm text-gray-600 mb-4 line-clamp-2">{donation.description || 'No description provided.'}</p>
                
                <div className="space-y-2 mt-auto">
                  <div className="flex items-center text-sm text-gray-500">
                    <span className="font-medium mr-2">Quantity:</span> 
                    {donation.quantity} {donation.unit}
                  </div>
                  <div className="grid grid-cols-2 gap-2 text-xs">
                    <div className="rounded-md bg-green-50 p-2 text-green-800">
                      <Utensils className="w-3 h-3 inline mr-1" />
                      {donation.estimatedMeals || 0} meals
                    </div>
                    <div className="rounded-md bg-emerald-50 p-2 text-emerald-800">
                      <Leaf className="w-3 h-3 inline mr-1" />
                      {donation.co2SavedKg || 0} kg CO2
                    </div>
                  </div>
                  {donation.safetyChecks?.freshPrepared && donation.safetyChecks?.coveredProperly && donation.safetyChecks?.noSpoilage && (
                    <div className="flex items-center text-xs text-green-700">
                      <ShieldCheck className="w-3 h-3 mr-1" />
                      Food safety confirmed
                    </div>
                  )}
                  <div className="flex items-center text-sm text-gray-500">
                    <Clock className="w-4 h-4 mr-1 text-gray-400" />
                    Expires: {new Date(donation.expiryTime).toLocaleString()}
                  </div>
                  
                  {donation.status === 'accepted' && donation.verificationPin && (
                    <div className="mt-2 p-3 bg-blue-50 border border-blue-100 rounded-lg flex items-center justify-between">
                      <div className="flex items-center text-blue-800 text-sm font-medium">
                        <Key className="w-4 h-4 mr-2" />
                        Collection PIN
                      </div>
                      <div className="text-xl font-bold tracking-widest text-blue-900">
                        {donation.verificationPin}
                      </div>
                    </div>
                  )}

                  {['collected', 'delivered'].includes(donation.status) && (
                    <ImpactCard donationId={donation._id} />
                  )}
                </div>
              </div>
              
              <div className="px-5 py-3 border-t border-gray-50 bg-gray-50 flex justify-end">
                {donation.status === 'pending' && (
                  <button onClick={() => handleDelete(donation._id)} className="text-red-500 hover:text-red-700 flex items-center text-sm font-medium transition-colors">
                    <Trash2 className="w-4 h-4 mr-1" /> Delete
                  </button>
                )}
                {donation.status === 'accepted' && (
                  <span className="text-sm text-blue-600 flex items-center">
                    <CheckCircle className="w-4 h-4 mr-1" /> Waiting for pickup
                  </span>
                )}
                {['collected', 'delivered'].includes(donation.status) && (
                  <span className="text-sm text-green-700 flex items-center">
                    <CheckCircle className="w-4 h-4 mr-1" /> Impact ready
                  </span>
                )}
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

export default MyDonations;
