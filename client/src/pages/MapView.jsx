import { useState, useEffect } from 'react';
import { MapContainer, TileLayer, Marker, Popup, useMap } from 'react-leaflet';
import 'leaflet/dist/leaflet.css';
import L from 'leaflet';
import api from '../api/axios';
import { toast } from 'react-toastify';
import { Clock, Navigation, CheckCircle, ShieldCheck, Utensils, Leaf } from 'lucide-react';

// Fix for default marker icons in React Leaflet (Sometimes causes issues in newer React/Vite setups)
// delete L.Icon.Default.prototype._getIconUrl;
// L.Icon.Default.mergeOptions({
//   iconRetinaUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-icon-2x.png',
//   iconUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-icon.png',
//   shadowUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-shadow.png',
// });

const RecenterAutomatically = ({ lat, lng }) => {
  const map = useMap();
  useEffect(() => {
    if (lat && lng) {
      map.setView([lat, lng]);
    }
  }, [lat, lng, map]);
  return null;
};

const formatTimeLeft = (minutesLeft) => {
  if (minutesLeft <= 0) return 'Expired';
  if (minutesLeft < 60) return `${minutesLeft} min left`;

  const hours = Math.floor(minutesLeft / 60);
  const minutes = minutesLeft % 60;
  return `${hours}h ${minutes}m left`;
};

const urgencyStyles = {
  critical: 'bg-red-50 text-red-700 border-red-200',
  urgent: 'bg-orange-50 text-orange-700 border-orange-200',
  normal: 'bg-green-50 text-green-700 border-green-200'
};

const criticalDonationIcon = L.divIcon({
  className: '',
  html: '<div style="width:24px;height:24px;border-radius:9999px;background:#dc2626;border:3px solid white;box-shadow:0 8px 16px rgba(220,38,38,0.35);display:flex;align-items:center;justify-content:center;color:white;font-size:12px;font-weight:700">!</div>',
  iconSize: [24, 24],
  iconAnchor: [12, 12],
  popupAnchor: [0, -12]
});

const MapView = () => {
  const [donations, setDonations] = useState([]);
  const [location, setLocation] = useState({ lat: null, lng: null });
  const [loading, setLoading] = useState(true);
  const [radius, setRadius] = useState(10); // km

  useEffect(() => {
    getUserLocation();
  }, []);

  useEffect(() => {
    if (location.lat && location.lng) {
      fetchNearbyDonations();
    }
  }, [location, radius]);

  const getUserLocation = () => {
    if (!navigator.geolocation) {
      toast.error('Geolocation is not supported');
      setLoading(false);
      return;
    }

    navigator.geolocation.getCurrentPosition(
      (position) => {
        setLocation({
          lat: position.coords.latitude,
          lng: position.coords.longitude
        });
      },
      (error) => {
        toast.error('Please enable location to find nearby donations');
        // Default to some central location (e.g., New Delhi) if denied
        setLocation({ lat: 28.6139, lng: 77.2090 });
        setLoading(false);
      }
    );
  };

  const fetchNearbyDonations = async () => {
    setLoading(true);
    try {
      const res = await api.get(`/donations?lat=${location.lat}&lng=${location.lng}&radius=${radius}&status=pending`);
      setDonations(res.data);
    } catch (error) {
      toast.error('Failed to fetch donations');
    } finally {
      setLoading(false);
    }
  };

  const handleAccept = async (id) => {
    try {
      await api.put(`/donations/${id}/accept`);
      toast.success('Donation accepted! Donor has been notified.');
      fetchNearbyDonations(); // Refresh the list
    } catch (error) {
      toast.error(error.response?.data?.message || 'Error accepting donation');
    }
  };

  return (
    <div className="flex flex-col h-[calc(100vh-4rem)]">
      {/* Controls Header */}
      <div className="bg-white border-b border-gray-100 p-4 shadow-sm z-10 flex flex-wrap items-center justify-between gap-4">
        <div>
          <h1 className="text-xl font-bold text-gray-900">Smart Rescue Queue</h1>
          <p className="text-sm text-gray-500">Prioritized by expiry time, distance, and meals saved within {radius}km</p>
        </div>
        
        <div className="flex items-center gap-3">
          <label className="text-sm font-medium text-gray-700">Radius:</label>
          <select 
            value={radius} 
            onChange={(e) => setRadius(Number(e.target.value))}
            className="input-field py-1 text-sm bg-gray-50"
          >
            <option value={5}>5 km</option>
            <option value={10}>10 km</option>
            <option value={20}>20 km</option>
            <option value={50}>50 km</option>
          </select>
          <button onClick={getUserLocation} className="btn-outline py-1 px-3 text-sm flex items-center gap-1">
            <Navigation className="w-4 h-4" /> Recenter
          </button>
        </div>
      </div>

      <div className="flex-grow flex flex-col md:flex-row relative">
        {/* Map Area */}
        <div className="w-full md:w-2/3 h-64 md:h-full relative z-0">
          {location.lat && (
            <MapContainer 
              key={`${location.lat}-${location.lng}`} 
              center={[location.lat, location.lng]} 
              zoom={13} 
              style={{ height: '100%', width: '100%' }}
            >
              <TileLayer
                attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a>'
                url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
              />
              <RecenterAutomatically lat={location.lat} lng={location.lng} />
              
              {/* User Location Marker */}
              <Marker position={[location.lat, location.lng]} opacity={0.7}>
                <Popup>Your current location</Popup>
              </Marker>
              
              {/* Donation Markers */}
              {Array.isArray(donations) && donations.filter(d => d.location && d.location.lat).map(donation => (
                <Marker
                  key={donation._id}
                  position={[donation.location.lat, donation.location.lng]}
                  {...(donation.insights?.urgencyLevel === 'critical' ? { icon: criticalDonationIcon } : {})}
                >
                  <Popup className="custom-popup">
                    <div className="p-1 min-w-[200px]">
                      <div className="flex items-start justify-between gap-2">
                        <h3 className="font-bold text-lg text-gray-900">{donation.foodName}</h3>
                        {donation.insights?.urgencyLevel === 'critical' && (
                          <span className="text-[10px] px-2 py-1 rounded-full font-bold bg-red-100 text-red-700 border border-red-200">CRITICAL</span>
                        )}
                      </div>
                      <p className="text-sm text-gray-600 mb-2">{donation.quantity} {donation.unit}</p>
                      
                      <div className="flex items-center text-xs text-orange-600 mb-3 bg-orange-50 p-1 rounded">
                        <Clock className="w-3 h-3 mr-1" />
                        {formatTimeLeft(donation.insights?.minutesLeft || 0)}
                      </div>
                      <p className="text-xs text-gray-600 mb-3">
                        {donation.insights?.mealsEstimate || donation.estimatedMeals || 0} meals | {donation.storageType || 'storage not specified'}
                      </p>
                      <p className="text-xs text-gray-600 mb-3">
                        Risk score: {donation.insights?.riskScore ?? donation.riskScore ?? 0}/100
                      </p>
                      
                      <button 
                        onClick={() => handleAccept(donation._id)}
                        className="w-full bg-green-600 text-white text-sm py-2 rounded-md hover:bg-green-700 transition-colors"
                      >
                        Accept Pickup
                      </button>
                    </div>
                  </Popup>
                </Marker>
              ))}
            </MapContainer>
          )}
          {loading && (
            <div className="absolute inset-0 bg-white/80 flex items-center justify-center z-[400]">
              <div className="animate-pulse text-green-600 font-medium text-lg">Loading Map...</div>
            </div>
          )}
        </div>
        
        {/* List View Sidebar */}
        <div className="w-full md:w-1/3 bg-gray-50 border-l border-gray-200 overflow-y-auto h-full p-4">
          <h2 className="font-bold text-gray-900 mb-1">{donations.length} Rescue Opportunities</h2>
          <p className="text-xs text-gray-500 mb-4">Critical pickups are shown first to prevent waste.</p>
          
          <div className="space-y-4">
            {Array.isArray(donations) && donations.map(donation => (
              <div key={donation._id} className="bg-white p-4 rounded-xl shadow-sm border border-gray-100 hover:shadow-md transition-shadow">
                <div className="flex justify-between items-start mb-2">
                  <h3 className="font-bold text-gray-900 line-clamp-1">{donation.foodName}</h3>
                  <span className={`text-xs px-2 py-1 rounded-full font-semibold border whitespace-nowrap ${urgencyStyles[donation.insights?.urgencyLevel || 'normal']}`}>
                    {donation.insights?.urgencyLevel || 'normal'}
                  </span>
                </div>
                
                <p className="text-sm text-gray-500 mb-3 line-clamp-2">By {donation.donor?.name || 'Unknown Donor'}</p>

                <div className="grid grid-cols-2 gap-2 text-xs mb-3">
                  <div className="bg-gray-50 rounded-md p-2">
                    <div className="text-gray-500">Distance</div>
                    <div className="font-semibold text-gray-900">{donation.distance?.toFixed(1)} km</div>
                  </div>
                  <div className="bg-gray-50 rounded-md p-2">
                    <div className="text-gray-500">Priority</div>
                    <div className="font-semibold text-gray-900">{donation.insights?.urgencyScore || 0}/100</div>
                  </div>
                  <div className="bg-green-50 rounded-md p-2">
                    <div className="text-green-700 flex items-center gap-1"><Utensils className="w-3 h-3" /> Meals</div>
                    <div className="font-semibold text-green-900">{donation.insights?.mealsEstimate || donation.estimatedMeals || 0}</div>
                  </div>
                  <div className="bg-emerald-50 rounded-md p-2">
                    <div className="text-emerald-700 flex items-center gap-1"><Leaf className="w-3 h-3" /> CO2 avoided</div>
                    <div className="font-semibold text-emerald-900">{donation.insights?.co2SavedKg || donation.co2SavedKg || 0} kg</div>
                  </div>
                </div>

                <div className="flex flex-wrap gap-2 text-xs text-gray-600 mb-3">
                  <span className="px-2 py-1 rounded-md bg-gray-100">{donation.foodType || 'food type not set'}</span>
                  <span className="px-2 py-1 rounded-md bg-gray-100">{donation.storageType || 'storage not set'}</span>
                  {donation.safetyChecks?.freshPrepared && donation.safetyChecks?.coveredProperly && donation.safetyChecks?.noSpoilage && (
                    <span className="px-2 py-1 rounded-md bg-green-100 text-green-700 flex items-center gap-1">
                      <ShieldCheck className="w-3 h-3" /> Safety confirmed
                    </span>
                  )}
                </div>

                {donation.pickupInstructions && (
                  <p className="text-xs text-gray-500 mb-3 line-clamp-2">{donation.pickupInstructions}</p>
                )}
                
                <div className="flex justify-between items-center mt-3 pt-3 border-t border-gray-50">
                  <span className="text-xs font-medium text-orange-600 flex items-center bg-orange-50 px-2 py-1 rounded-md">
                    <Clock className="w-3 h-3 mr-1" />
                    {formatTimeLeft(donation.insights?.minutesLeft || 0)}
                  </span>
                  
                  <button 
                    onClick={() => handleAccept(donation._id)}
                    className="text-sm bg-green-50 text-green-700 hover:bg-green-600 hover:text-white px-3 py-1.5 rounded-md font-medium transition-colors flex items-center gap-1"
                  >
                    <CheckCircle className="w-4 h-4" /> Accept
                  </button>
                </div>
              </div>
            ))}
            
            {(!Array.isArray(donations) || donations.length === 0) && !loading && (
              <div className="text-center py-10 text-gray-500">
                No pending donations found in this area. Try expanding your radius.
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default MapView;
