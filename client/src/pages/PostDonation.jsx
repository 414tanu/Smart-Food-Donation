import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import api from '../api/axios';
import { toast } from 'react-toastify';
import { MapPin, Image as ImageIcon, Clock, ShieldCheck } from 'lucide-react';

const PostDonation = () => {
  const [formData, setFormData] = useState({
    foodName: '',
    category: 'cooked',
    foodType: 'vegetarian',
    storageType: 'room-temperature',
    quantity: '',
    unit: 'servings',
    description: '',
    pickupInstructions: '',
    expiryHours: '3'
  });
  const [safetyChecks, setSafetyChecks] = useState({
    freshPrepared: false,
    coveredProperly: false,
    noSpoilage: false
  });
  const [image, setImage] = useState(null);
  const [location, setLocation] = useState({ lat: null, lng: null, address: '' });
  const [isSubmitting, setIsSubmitting] = useState(false);
  
  const navigate = useNavigate();

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleSafetyChange = (e) => {
    setSafetyChecks({ ...safetyChecks, [e.target.name]: e.target.checked });
  };

  const handleImageChange = (e) => {
    if (e.target.files && e.target.files[0]) {
      setImage(e.target.files[0]);
    }
  };

  const getLocation = () => {
    if (!navigator.geolocation) {
      toast.error('Geolocation is not supported by your browser');
      return;
    }
    
    toast.info('Fetching your location...');
    navigator.geolocation.getCurrentPosition(
      (position) => {
        setLocation({
          lat: position.coords.latitude,
          lng: position.coords.longitude,
          address: 'Current Location'
        });
        toast.success('Location fetched successfully!');
      },
      (error) => {
        toast.error('Unable to retrieve your location');
      }
    );
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!location.lat || !location.lng) {
      return toast.error('Please provide a pickup location');
    }

    if (!safetyChecks.freshPrepared || !safetyChecks.coveredProperly || !safetyChecks.noSpoilage) {
      return toast.error('Please confirm all food safety checks');
    }

    setIsSubmitting(true);
    try {
      const expiryDate = new Date();
      expiryDate.setHours(expiryDate.getHours() + parseInt(formData.expiryHours));

      const data = new FormData();
      data.append('foodName', formData.foodName);
      data.append('category', formData.category);
      data.append('foodType', formData.foodType);
      data.append('storageType', formData.storageType);
      data.append('quantity', formData.quantity);
      data.append('unit', formData.unit);
      data.append('description', formData.description);
      data.append('pickupInstructions', formData.pickupInstructions);
      data.append('expiryTime', expiryDate.toISOString());
      data.append('freshPrepared', safetyChecks.freshPrepared);
      data.append('coveredProperly', safetyChecks.coveredProperly);
      data.append('noSpoilage', safetyChecks.noSpoilage);
      data.append('locationStr', JSON.stringify({
        lat: location.lat,
        lng: location.lng,
        address: location.address
      }));
      
      if (image) {
        data.append('image', image);
      }

      await api.post('/donations', data, {
        headers: { 'Content-Type': 'multipart/form-data' }
      });

      toast.success('Donation posted successfully!');
      navigate('/my-donations');
    } catch (error) {
      toast.error(error.response?.data?.message || 'Error posting donation');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="max-w-3xl mx-auto px-4 py-10">
      <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-8">
        <h1 className="text-2xl font-bold text-gray-900 mb-6">Post a Food Donation</h1>
        
        <form onSubmit={handleSubmit} className="space-y-6">
          <div className="grid md:grid-cols-2 gap-6">
            <div className="col-span-2 md:col-span-1">
              <label className="block text-sm font-medium text-gray-700 mb-1">Food Name / Title</label>
              <input type="text" name="foodName" required className="input-field" placeholder="e.g., Rice and Curry, 5 boxes of Pizza" value={formData.foodName} onChange={handleChange} />
            </div>
            
            <div className="col-span-2 md:col-span-1">
              <label className="block text-sm font-medium text-gray-700 mb-1">Category</label>
              <select name="category" className="input-field bg-white" value={formData.category} onChange={handleChange}>
                <option value="cooked">Cooked Food</option>
                <option value="raw">Raw Ingredients</option>
                <option value="packaged">Packaged / Processed</option>
              </select>
            </div>

            <div className="col-span-2 md:col-span-1">
              <label className="block text-sm font-medium text-gray-700 mb-1">Food Type</label>
              <select name="foodType" className="input-field bg-white" value={formData.foodType} onChange={handleChange}>
                <option value="vegetarian">Vegetarian</option>
                <option value="non-vegetarian">Non-vegetarian</option>
                <option value="mixed">Mixed</option>
              </select>
            </div>

            <div className="col-span-2 md:col-span-1">
              <label className="block text-sm font-medium text-gray-700 mb-1">Storage Condition</label>
              <select name="storageType" className="input-field bg-white" value={formData.storageType} onChange={handleChange}>
                <option value="hot">Kept Hot</option>
                <option value="room-temperature">Room Temperature</option>
                <option value="refrigerated">Refrigerated</option>
                <option value="frozen">Frozen</option>
                <option value="sealed-packaged">Sealed / Packaged</option>
              </select>
            </div>
            
            <div className="col-span-2 md:col-span-1 flex gap-2">
              <div className="flex-grow">
                <label className="block text-sm font-medium text-gray-700 mb-1">Quantity</label>
                <input type="number" name="quantity" required min="1" className="input-field" value={formData.quantity} onChange={handleChange} />
              </div>
              <div className="w-1/3">
                <label className="block text-sm font-medium text-gray-700 mb-1">Unit</label>
                <select name="unit" className="input-field bg-white" value={formData.unit} onChange={handleChange}>
                  <option value="servings">Servings</option>
                  <option value="kg">Kg</option>
                </select>
              </div>
            </div>
            
            <div className="col-span-2 md:col-span-1">
              <label className="block text-sm font-medium text-gray-700 mb-1 flex items-center gap-1">
                <Clock className="w-4 h-4 text-gray-400" /> Expiry Time
              </label>
              <select name="expiryHours" className="input-field bg-white" value={formData.expiryHours} onChange={handleChange}>
                <option value="1">Valid for next 1 Hour</option>
                <option value="2">Valid for next 2 Hours</option>
                <option value="3">Valid for next 3 Hours</option>
                <option value="6">Valid for next 6 Hours</option>
                <option value="12">Valid for next 12 Hours</option>
                <option value="24">Valid for 24 Hours</option>
              </select>
            </div>
            
            <div className="col-span-2">
              <label className="block text-sm font-medium text-gray-700 mb-1">Description & Special Notes</label>
              <textarea name="description" rows="3" className="input-field" placeholder="E.g., Vegetarian only, contains nuts, pick up before 5 PM..." value={formData.description} onChange={handleChange} required></textarea>
            </div>

            <div className="col-span-2">
              <label className="block text-sm font-medium text-gray-700 mb-1">Pickup Instructions</label>
              <textarea name="pickupInstructions" rows="2" className="input-field" placeholder="Gate number, contact person, packaging count, parking note..." value={formData.pickupInstructions} onChange={handleChange} required></textarea>
            </div>

            <div className="col-span-2 rounded-lg border border-green-100 bg-green-50 p-4">
              <div className="flex items-center gap-2 text-sm font-semibold text-green-800 mb-3">
                <ShieldCheck className="w-4 h-4" />
                Food safety confirmation
              </div>
              <div className="grid sm:grid-cols-3 gap-3">
                <label className="flex items-start gap-2 text-sm text-gray-700">
                  <input type="checkbox" name="freshPrepared" checked={safetyChecks.freshPrepared} onChange={handleSafetyChange} className="mt-1" />
                  Fresh and safe for pickup
                </label>
                <label className="flex items-start gap-2 text-sm text-gray-700">
                  <input type="checkbox" name="coveredProperly" checked={safetyChecks.coveredProperly} onChange={handleSafetyChange} className="mt-1" />
                  Covered or packed properly
                </label>
                <label className="flex items-start gap-2 text-sm text-gray-700">
                  <input type="checkbox" name="noSpoilage" checked={safetyChecks.noSpoilage} onChange={handleSafetyChange} className="mt-1" />
                  No smell, spoilage, or contamination
                </label>
              </div>
            </div>
            
            <div className="col-span-2 md:col-span-1">
              <label className="block text-sm font-medium text-gray-700 mb-1 flex items-center gap-1">
                <ImageIcon className="w-4 h-4 text-gray-400" /> Food Image
              </label>
              <input type="file" accept="image/*" onChange={handleImageChange} required className="w-full text-sm text-gray-500 file:mr-4 file:py-2 file:px-4 file:rounded-full file:border-0 file:text-sm file:font-semibold file:bg-green-50 file:text-green-700 hover:file:bg-green-100" />
            </div>
            
            <div className="col-span-2 md:col-span-1">
              <label className="block text-sm font-medium text-gray-700 mb-1 flex items-center gap-1">
                <MapPin className="w-4 h-4 text-gray-400" /> Pickup Location
              </label>
              <div className="flex gap-2">
                <button type="button" onClick={getLocation} className="flex-grow btn-outline py-2 text-sm">
                  {location.lat ? 'Location ✓' : 'Pin Current Location'}
                </button>
              </div>
              {!location.lat && <p className="text-xs text-red-500 mt-1">Required so NGOs can find you.</p>}
            </div>
          </div>
          
          <div className="pt-4 border-t border-gray-100">
            <button type="submit" disabled={isSubmitting || !location.lat || !safetyChecks.freshPrepared || !safetyChecks.coveredProperly || !safetyChecks.noSpoilage} className={`w-full btn-primary py-3 ${isSubmitting || !location.lat || !safetyChecks.freshPrepared || !safetyChecks.coveredProperly || !safetyChecks.noSpoilage ? 'opacity-70 cursor-not-allowed' : ''}`}>
              {isSubmitting ? 'Posting...' : 'Post Donation'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default PostDonation;
