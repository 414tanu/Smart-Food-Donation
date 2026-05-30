import { useState, useContext } from 'react';
import { User, Phone, Lock, Save, ShieldCheck } from 'lucide-react';
import AuthContext from '../context/AuthContext';
import { toast } from 'react-toastify';

const Profile = () => {
  const { user, updateProfile } = useContext(AuthContext);
  
  const [formData, setFormData] = useState({
    name: user?.name || '',
    phone: user?.phone || '',
    currentPassword: '',
    newPassword: '',
    confirmPassword: ''
  });
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData({
      ...formData,
      [name]: name === 'phone' ? value.replace(/\D/g, '').slice(0, 10) : value
    });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    if (formData.phone && formData.phone.length !== 10) {
      toast.error('Phone number must be exactly 10 digits');
      return;
    }

    if (formData.newPassword) {
      if (!formData.currentPassword) {
        toast.error('Please enter your current password to change it');
        return;
      }
      if (formData.newPassword.length < 8) {
        toast.error('New password must be at least 8 characters');
        return;
      }
      if (formData.newPassword !== formData.confirmPassword) {
        toast.error('New passwords do not match');
        return;
      }
    } else if (formData.currentPassword) {
        toast.error('Please enter a new password');
        return;
    }

    setIsSubmitting(true);
    try {
      const dataToSubmit = {
        name: formData.name,
        phone: formData.phone
      };
      
      if (formData.currentPassword && formData.newPassword) {
        dataToSubmit.currentPassword = formData.currentPassword;
        dataToSubmit.newPassword = formData.newPassword;
      }

      await updateProfile(dataToSubmit);
      toast.success('Profile updated successfully!');
      
      // Clear password fields on success
      setFormData(prev => ({
        ...prev,
        currentPassword: '',
        newPassword: '',
        confirmPassword: ''
      }));
    } catch (error) {
      toast.error(error);
    } finally {
      setIsSubmitting(false);
    }
  };

  if (!user) return null;

  return (
    <div className="min-h-[calc(100vh-4rem)] py-12 px-4 sm:px-6 lg:px-8 bg-gray-50 flex justify-center">
      <div className="max-w-2xl w-full">
        <div className="glass-card p-8">
          <div className="flex items-center space-x-4 mb-8 pb-6 border-b border-gray-100">
            <div className="w-16 h-16 bg-emerald-100 rounded-full flex items-center justify-center text-emerald-600">
              <User className="w-8 h-8" />
            </div>
            <div>
              <h2 className="text-2xl font-bold text-gray-900">Account Settings</h2>
              <p className="text-gray-500">Update your profile details and security settings</p>
            </div>
          </div>

          <form onSubmit={handleSubmit} className="space-y-6">
            {/* Read-only Information */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6 bg-gray-50 p-4 rounded-xl border border-gray-100">
              <div>
                <label className="block text-sm font-medium text-gray-500 mb-1">Email Address</label>
                <div className="text-gray-900 font-medium">{user.email}</div>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-500 mb-1">Account Role</label>
                <div className="text-gray-900 font-medium capitalize flex items-center">
                  {user.role} 
                  {user.role === 'ngo' && <ShieldCheck className="w-4 h-4 ml-2 text-emerald-600" />}
                </div>
              </div>
              {user.organization && (
                <div className="md:col-span-2">
                  <label className="block text-sm font-medium text-gray-500 mb-1">Organization</label>
                  <div className="text-gray-900 font-medium">{user.organization}</div>
                </div>
              )}
            </div>

            <div className="border-t border-gray-100 pt-6">
              <h3 className="text-lg font-medium text-gray-900 mb-4">Personal Details</h3>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    <div className="flex items-center"><User className="w-4 h-4 mr-1 text-gray-400"/> Full Name</div>
                  </label>
                  <input
                    type="text"
                    name="name"
                    value={formData.name}
                    onChange={handleChange}
                    className="input-field"
                    required
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    <div className="flex items-center"><Phone className="w-4 h-4 mr-1 text-gray-400"/> Phone Number</div>
                  </label>
                  <input
                    type="tel"
                    name="phone"
                    value={formData.phone}
                    onChange={handleChange}
                    className="input-field"
                    pattern="\d{10}"
                    maxLength={10}
                    required
                  />
                </div>
              </div>
            </div>

            <div className="border-t border-gray-100 pt-6">
              <h3 className="text-lg font-medium text-gray-900 mb-4">Security</h3>
              <p className="text-sm text-gray-500 mb-4">Leave these fields blank if you don't want to change your password.</p>
              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    <div className="flex items-center"><Lock className="w-4 h-4 mr-1 text-gray-400"/> Current Password</div>
                  </label>
                  <input
                    type="password"
                    name="currentPassword"
                    value={formData.currentPassword}
                    onChange={handleChange}
                    className="input-field"
                  />
                </div>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">New Password</label>
                    <input
                      type="password"
                      name="newPassword"
                      value={formData.newPassword}
                      onChange={handleChange}
                      className="input-field"
                      minLength={8}
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Confirm New Password</label>
                    <input
                      type="password"
                      name="confirmPassword"
                      value={formData.confirmPassword}
                      onChange={handleChange}
                      className="input-field"
                      minLength={8}
                    />
                  </div>
                </div>
              </div>
            </div>

            <div className="border-t border-gray-100 pt-6 flex justify-end">
              <button
                type="submit"
                disabled={isSubmitting}
                className={`flex items-center btn-primary ${
                  isSubmitting ? 'opacity-70 cursor-not-allowed' : ''
                }`}
              >
                <Save className="w-4 h-4 mr-2" />
                {isSubmitting ? 'Saving...' : 'Save Changes'}
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
};

export default Profile;
