import { useState, useContext, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import AuthContext from '../context/AuthContext';
import { toast } from 'react-toastify';
import { UserPlus, MapPin } from 'lucide-react';
import { validateEmail, validatePassword, validatePhone } from '../utils/validation';
import api from '../api/axios';

const Register = () => {
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    password: '',
    phone: '',
    role: 'donor', // default role
    organization: '',
    organizationId: '',
  });
  const [location, setLocation] = useState({ lat: null, lng: null, address: '' });
  const [verifiedOrganizations, setVerifiedOrganizations] = useState([]);
  const [isSubmitting, setIsSubmitting] = useState(false);
  
  const { register } = useContext(AuthContext);
  const navigate = useNavigate();

  useEffect(() => {
    const fetchVerifiedOrganizations = async () => {
      try {
        const { data } = await api.get('/auth/verified-organizations');
        setVerifiedOrganizations(data);
      } catch (error) {
        toast.error('Could not load verified organizations');
      }
    };

    fetchVerifiedOrganizations();
  }, []);

  const selectedOrganization = verifiedOrganizations.find(
    (organization) => organization.id === formData.organizationId
  );

  const handleChange = (e) => {
    const { name, value } = e.target;
    const nextFormData = {
      ...formData,
      [name]: name === 'phone' ? value.replace(/\D/g, '').slice(0, 10) : value
    };

    if (name === 'role' && value !== 'ngo') {
      nextFormData.organization = '';
      nextFormData.organizationId = '';
    }

    if (name === 'organizationId') {
      const organization = verifiedOrganizations.find((item) => item.id === value);
      nextFormData.organization = organization?.name || '';
    }

    setFormData(nextFormData);
  };

  const getLocation = () => {
    if (!navigator.geolocation) {
      toast.warning('Geolocation not supported. Using default city location.');
      setLocation({
        ...location,
        lat: 28.6139,
        lng: 77.2090,
        address: 'New Delhi (Default Location)'
      });
      return;
    }
    
    toast.info('Fetching location...');
    navigator.geolocation.getCurrentPosition(
      (position) => {
        setLocation({
          ...location,
          lat: position.coords.latitude,
          lng: position.coords.longitude,
          address: 'Location pinned (coordinates saved)'
        });
        toast.success('Location fetched successfully!');
      },
      (error) => {
        toast.warning('Location permission denied. Using default city location.');
        setLocation({
          ...location,
          lat: 28.6139,
          lng: 77.2090,
          address: 'New Delhi (Default Location)'
        });
      }
    );
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    const trimmedEmail = formData.email.trim();

    if (!validatePhone(formData.phone)) {
      toast.error('Phone number must be exactly 10 digits');
      return;
    }

    if (!validateEmail(trimmedEmail)) {
      toast.error('Please enter a valid email address');
      return;
    }

    if (!validatePassword(formData.password)) {
      toast.error('Password must be at least 8 characters');
      return;
    }

    if (formData.role === 'ngo' && !selectedOrganization) {
      toast.error('Please select a verified NGO organization');
      return;
    }

    if (formData.role === 'donor' && (!location.lat || !location.lng)) {
      toast.error('Please capture your location before registering');
      return;
    }

    const registrationLocation = formData.role === 'ngo' ? selectedOrganization.location : location;

    setIsSubmitting(true);
    try {
      await register({
        ...formData,
        email: trimmedEmail,
        location: {
          lat: registrationLocation.lat,
          lng: registrationLocation.lng,
          address: registrationLocation.address || 'Address provided during registration'
        }
      });
      toast.success('Registration successful!');
      navigate('/dashboard');
    } catch (error) {
      toast.error(error);
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="min-h-[calc(100vh-4rem)] py-12 px-4 sm:px-6 lg:px-8 bg-gray-50 flex items-center justify-center">
      <div className="max-w-md w-full glass-card p-8">
        <div className="text-center mb-8">
          <div className="mx-auto w-12 h-12 bg-green-100 rounded-full flex items-center justify-center mb-4">
            <UserPlus className="w-6 h-6 text-green-600" />
          </div>
          <h2 className="text-3xl font-extrabold text-gray-900">Create an account</h2>
          <p className="mt-2 text-sm text-gray-600">
            Already have an account?{' '}
            <Link to="/login" className="font-medium text-green-600 hover:text-green-500">
              Sign in
            </Link>
          </p>
        </div>

        <form className="space-y-6" onSubmit={handleSubmit}>
          <div className="grid grid-cols-2 gap-4">
            <div className="col-span-2 sm:col-span-1">
              <label className="block text-sm font-medium text-gray-700 mb-1">Full Name</label>
              <input type="text" name="name" required className="input-field" value={formData.name} onChange={handleChange} />
            </div>
            <div className="col-span-2 sm:col-span-1">
              <label className="block text-sm font-medium text-gray-700 mb-1">Phone Number</label>
              <input type="tel" name="phone" required className="input-field" value={formData.phone} onChange={handleChange} inputMode="numeric" pattern="\d{10}" maxLength={10} placeholder="10 digit number" />
            </div>
            <div className="col-span-2">
              <label className="block text-sm font-medium text-gray-700 mb-1">Email address</label>
              <input type="email" name="email" required className="input-field" value={formData.email} onChange={handleChange} autoComplete="email" />
            </div>
            <div className="col-span-2">
              <label className="block text-sm font-medium text-gray-700 mb-1">Password</label>
              <input type="password" name="password" required className="input-field" value={formData.password} onChange={handleChange} minLength={8} autoComplete="new-password" />
            </div>
            <div className="col-span-2">
              <label className="block text-sm font-medium text-gray-700 mb-1">I want to...</label>
              <select name="role" required className="input-field bg-white" value={formData.role} onChange={handleChange}>
                <option value="donor">Donate Food (Donor)</option>
                <option value="ngo">Collect Food (NGO/Volunteer)</option>
              </select>
            </div>
            
            {formData.role === 'ngo' && (
              <div className="col-span-2 animate-fade-in">
                <label className="block text-sm font-medium text-gray-700 mb-1">Organization Name</label>
                <select name="organizationId" required className="input-field bg-white" value={formData.organizationId} onChange={handleChange}>
                  <option value="">Select a verified NGO</option>
                  {verifiedOrganizations.map((organization) => (
                    <option key={organization.id} value={organization.id}>
                      {organization.name}
                    </option>
                  ))}
                </select>
                {selectedOrganization && (
                  <p className="text-xs text-gray-500 mt-1">
                    Registered location: {selectedOrganization.location.address}
                  </p>
                )}
              </div>
            )}
            
            <div className="col-span-2">
              <label className="block text-sm font-medium text-gray-700 mb-2">
                {formData.role === 'ngo' ? 'Organization Location' : 'Your Location'}
              </label>
              {formData.role === 'ngo' ? (
                <input
                  type="text"
                  className="input-field"
                  value={selectedOrganization?.location.address || 'Select a verified NGO to load its registered location'}
                  readOnly
                />
              ) : (
                <>
                  <div className="flex items-center gap-2">
                    <button 
                      type="button" 
                      onClick={getLocation}
                      className="flex-grow flex items-center justify-center gap-2 py-2 px-4 border border-gray-300 rounded-lg shadow-sm bg-white text-sm font-medium text-gray-700 hover:bg-gray-50 focus:outline-none"
                    >
                      <MapPin className="w-4 h-4 text-orange-500" />
                      {location.lat ? 'Location Captured ✓' : 'Get Current Location'}
                    </button>
                  </div>
                  <input
                    type="text"
                    className="input-field mt-2"
                    placeholder="Address or area"
                    value={location.address}
                    onChange={(e) => setLocation({ ...location, address: e.target.value })}
                  />
                  {!location.lat && <p className="text-xs text-gray-500 mt-1">GPS location is required so nearby NGOs can find donations accurately.</p>}
                </>
              )}
            </div>
          </div>

          <button
            type="submit"
            disabled={isSubmitting}
            className={`w-full py-3 px-4 border border-transparent rounded-lg shadow-sm text-sm font-medium text-white bg-green-600 hover:bg-green-700 transition-colors ${
              isSubmitting ? 'opacity-70 cursor-not-allowed' : ''
            }`}
          >
            {isSubmitting ? 'Creating account...' : 'Create Account'}
          </button>
        </form>
      </div>
    </div>
  );
};

export default Register;
