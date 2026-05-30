import { useState, useEffect } from 'react';
import api from '../api/axios';
import { toast } from 'react-toastify';
import { Clock, CheckCircle, Package, MapPin, Phone, User, Key } from 'lucide-react';
import ImpactCard from '../components/ImpactCard';

const MyPickups = () => {
  const [donations, setDonations] = useState([]);
  const [loading, setLoading] = useState(true);
  const [pins, setPins] = useState({});

  useEffect(() => {
    fetchPickups();
  }, []);

  const fetchPickups = async () => {
    try {
      const res = await api.get('/donations/my-pickups');
      setDonations(res.data);
    } catch (error) {
      toast.error('Failed to fetch pickups');
    } finally {
      setLoading(false);
    }
  };

  const handlePinChange = (id, value) => {
    setPins({ ...pins, [id]: value });
  };

  const handleVerifyAndCollect = async (id) => {
    const pin = pins[id];
    if (!pin || pin.length !== 4) {
      return toast.error('Please enter the 4-digit PIN provided by the donor.');
    }

    try {
      await api.put(`/donations/${id}/deliver`, { pin });
      toast.success('Collection verified successfully!');
      fetchPickups(); // Refresh the list
    } catch (error) {
      toast.error(error.response?.data?.message || 'Verification failed. Incorrect PIN.');
    }
  };

  const getStatusBadge = (status) => {
    switch(status) {
      case 'accepted': return <span className="px-3 py-1 bg-blue-100 text-blue-800 rounded-full text-xs font-medium border border-blue-200">To Pickup</span>;
      case 'collected': return <span className="px-3 py-1 bg-green-100 text-green-800 rounded-full text-xs font-medium border border-green-200">Collected</span>;
      case 'delivered': return <span className="px-3 py-1 bg-green-100 text-green-800 rounded-full text-xs font-medium border border-green-200">Delivered</span>;
      default: return null;
    }
  };

  if (loading) return <div className="text-center py-10">Loading...</div>;

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10">
      <h1 className="text-2xl font-bold text-gray-900 mb-6">My Pickups</h1>
      
      {donations.length === 0 ? (
        <div className="text-center py-20 bg-white rounded-2xl border border-gray-100 shadow-sm">
          <Package className="w-16 h-16 text-gray-300 mx-auto mb-4" />
          <h3 className="text-lg font-medium text-gray-900">No pickups yet</h3>
          <p className="text-gray-500 mt-1">Accept donations from the Live Map to see them here.</p>
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
                
                <div className="space-y-3 mt-3">
                  <div className="flex items-start text-sm text-gray-600">
                    <User className="w-4 h-4 mr-2 mt-0.5 text-gray-400" />
                    <div>
                      <div className="font-medium text-gray-900">{donation.donor?.name}</div>
                      <div className="text-xs">{donation.donor?.organization || 'Individual Donor'}</div>
                    </div>
                  </div>
                  
                  <div className="flex items-center text-sm text-gray-600">
                    <Phone className="w-4 h-4 mr-2 text-gray-400" />
                    {donation.donor?.phone || 'No phone provided'}
                  </div>

                  <div className="flex items-start text-sm text-gray-600">
                    <MapPin className="w-4 h-4 mr-2 mt-0.5 text-gray-400" />
                    <span className="line-clamp-2">{donation.location?.address || 'Address not provided'}</span>
                  </div>

                  <div className="flex items-center text-sm text-gray-500 mt-2">
                    <Clock className="w-4 h-4 mr-1 text-gray-400" />
                    Expires: {new Date(donation.expiryTime).toLocaleString()}
                  </div>

                  {donation.status === 'accepted' && (
                    <div className="mt-4 p-4 bg-gray-50 rounded-lg border border-gray-200">
                      <label className="block text-sm font-medium text-gray-700 mb-2 flex items-center">
                        <Key className="w-4 h-4 mr-1 text-gray-500" />
                        Enter Donor's PIN to Collect
                      </label>
                      <div className="flex gap-2">
                        <input
                          type="text"
                          maxLength="4"
                          placeholder="0000"
                          value={pins[donation._id] || ''}
                          onChange={(e) => handlePinChange(donation._id, e.target.value)}
                          className="block w-24 rounded-md border-gray-300 shadow-sm focus:border-green-500 focus:ring-green-500 text-center tracking-widest font-bold"
                        />
                        <button
                          onClick={() => handleVerifyAndCollect(donation._id)}
                          className="flex-1 bg-green-600 text-white px-4 py-2 rounded-md hover:bg-green-700 transition-colors text-sm font-medium"
                        >
                          Verify & Collect
                        </button>
                      </div>
                    </div>
                  )}

                  {['collected', 'delivered'].includes(donation.status) && (
                    <div className="mt-4 pt-4 border-t border-gray-100">
                      <div className="flex items-center text-green-700 text-sm font-medium mb-3">
                        <CheckCircle className="w-4 h-4 mr-1" />
                        Successfully Collected
                      </div>
                      <ImpactCard donationId={donation._id} />
                    </div>
                  )}
                </div>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

export default MyPickups;
