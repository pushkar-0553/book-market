import React, { useState, useEffect, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import toast from 'react-hot-toast';
import { 
  FiUser, FiMail, FiPhone, FiCalendar, FiCamera, 
  FiChevronLeft, FiCheckCircle, FiAlertCircle, FiX, FiCreditCard, FiSmartphone
} from 'react-icons/fi';
import { FcGoogle } from 'react-icons/fc';
import { FaYahoo } from 'react-icons/fa';
import DatePicker from 'react-datepicker';
import 'react-datepicker/dist/react-datepicker.css';
import TopUpDialog from '../components/TopUpDialog';

const ProfilePage = () => {
  const { user, wallet, logout, updateProfile, updateWallet } = useAuth();
  const navigate = useNavigate();
  const fileInputRef = useRef(null);

  const [isTopUpOpen, setIsTopUpOpen] = useState(false);

  const [formData, setFormData] = useState({
    name: user?.name || '',
    email: user?.email || '',
    mobile: user?.mobile || '',
    dob: user?.dob || '',
    profileImage: null,
    imagePreview: user?.avatar || null
  });

  const [errors, setErrors] = useState({});
  const [isSubmitting, setIsSubmitting] = useState(false);

  // Sync formData with user context if it changes
  useEffect(() => {
    if (user) {
      setFormData(prev => ({
        ...prev,
        name: user.name || '',
        email: user.email || '',
        mobile: user.mobile || '',
        dob: user.dob || '',
        imagePreview: user.avatar || null
      }));
    }
  }, [user]);

  // Email provider detection
  const getEmailProviderIcon = (email) => {
    if (!email) return null;
    if (email.toLowerCase().includes('@gmail.com') || email.toLowerCase().includes('@googlemail.com')) {
      return <FcGoogle size={20} />;
    }
    if (email.toLowerCase().includes('@yahoo.com') || email.toLowerCase().includes('@yahoo.co.in')) {
      return <FaYahoo size={18} color="#410093" />;
    }
    return null;
  };

  const validate = () => {
    const newErrors = {};
    
    // Name validation: Alpha only, max 20
    if (!formData.name) {
      newErrors.name = 'Name is required';
    } else if (!/^[a-zA-Z\s]+$/.test(formData.name)) {
      newErrors.name = 'Name should only contain alphabets';
    } else if (formData.name.length > 20) {
      newErrors.name = 'Name should not exceed 20 characters';
    }

    // Email validation
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!formData.email) {
      newErrors.email = 'Email is required';
    } else if (!emailRegex.test(formData.email)) {
      newErrors.email = 'Please enter a valid email address';
    }

    // Mobile validation: 10 digits
    if (!formData.mobile) {
      newErrors.mobile = 'Mobile number is required';
    } else if (!/^\d{10}$/.test(formData.mobile)) {
      newErrors.mobile = 'Mobile number must be 10 digits';
    }

    // DOB validation: Not future
    if (!formData.dob) {
      newErrors.dob = 'Date of birth is required';
    } else {
      const selectedDate = new Date(formData.dob);
      const today = new Date();
      today.setHours(0, 0, 0, 0);
      if (selectedDate > today) {
        newErrors.dob = 'Date of birth cannot be in the future';
      }
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
    
    // Clear error for this field
    if (errors[name]) {
      setErrors(prev => ({ ...prev, [name]: '' }));
    }
  };

  const handleImageChange = (e) => {
    const file = e.target.files[0];
    if (file) {
      // Validate file type
      if (!file.type.startsWith('image/')) {
        toast.error('Only image files are allowed');
        return;
      }
      // Validate size: 2MB = 2 * 1024 * 1024 bytes
      if (file.size > 2 * 1024 * 1024) {
        toast.error('Image size should be less than 2MB');
        return;
      }

      const reader = new FileReader();
      reader.onloadend = () => {
        setFormData(prev => ({
          ...prev,
          profileImage: file,
          imagePreview: reader.result
        }));
      };
      reader.readAsDataURL(file);
    }
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    if (validate()) {
      setIsSubmitting(true);
      // Simulate API call
      setTimeout(() => {
        setIsSubmitting(false);
        
        // Update global context which persists to localStorage
        updateProfile({
          name: formData.name,
          email: formData.email,
          mobile: formData.mobile,
          dob: formData.dob,
          avatar: formData.imagePreview // In real app, this would be a URL
        });

        toast.success('Profile saved to local storage!', {
          style: {
            background: 'var(--bg-elevated)',
            color: 'var(--text-primary)',
            borderRadius: '12px',
            border: '1px solid var(--border-default)'
          }
        });
      }, 1000);
    } else {
      toast.error('Please fix the errors in the form');
    }
  };

  const handleTopUp = (amount) => {
    updateWallet(amount);
  };

  return (
    <>
      <TopUpDialog 
        isOpen={isTopUpOpen} 
        onClose={() => setIsTopUpOpen(false)} 
        onTopUp={handleTopUp} 
      />
      <div className="profile-page animate-fade-in" style={{
      minHeight: 'calc(100vh - var(--navbar-h))',
      background: 'var(--bg-base)',
      padding: '2rem 1rem'
    }}>
      <div style={{ maxWidth: '800px', margin: '0 auto' }}>
        {/* Header */}
        <div style={{ display: 'flex', alignItems: 'center', gap: '1rem', marginBottom: '2rem' }}>
          <button 
            onClick={() => navigate(-1)}
            style={{
              width: '40px', height: '40px', borderRadius: '50%',
              background: 'white', border: '1px solid var(--border-default)',
              display: 'flex', alignItems: 'center', justifyContent: 'center',
              cursor: 'pointer', color: 'var(--text-secondary)'
            }}
          >
            <FiChevronLeft size={20} />
          </button>
          <div>
            <h1 style={{ fontSize: '1.75rem', fontWeight: 800, color: 'var(--navy-900)' }}>My Profile</h1>
            <p style={{ color: 'var(--text-muted)', fontSize: '0.9375rem' }}>Manage your personal information and preferences</p>
          </div>
        </div>

        <div style={{ 
          display: 'grid', 
          gridTemplateColumns: '300px 1fr', 
          gap: '2rem' 
        }}>
          {/* Left Column: Avatar & Actions */}
          <div className="card" style={{ padding: '2rem', textAlign: 'center', alignSelf: 'start' }}>
            <div style={{ position: 'relative', width: '120px', height: '120px', margin: '0 auto 1.5rem' }}>
              <div style={{
                width: '100%', height: '100%', borderRadius: '50%',
                background: 'linear-gradient(135deg, var(--navy-800), var(--navy-500))',
                display: 'flex', alignItems: 'center', justifyContent: 'center',
                overflow: 'hidden', border: '4px solid white', boxShadow: 'var(--shadow-lg)'
              }} id="profile-avatar-container">
                {formData.imagePreview ? (
                  <img src={formData.imagePreview} alt="Avatar" style={{ width: '100%', height: '100%', objectFit: 'cover' }} id="profile-avatar-img" />
                ) : (
                  <FiUser size={48} color="white" />
                )}
              </div>
              <label 
                htmlFor="profile-image-input"
                style={{
                  position: 'absolute', bottom: '0', right: '0',
                  width: '36px', height: '36px', borderRadius: '50%',
                  background: 'var(--accent-primary)', border: '3px solid white',
                  display: 'flex', alignItems: 'center', justifyContent: 'center',
                  cursor: 'pointer', boxShadow: 'var(--shadow-md)'
                }}
                id="upload-image-label"
                data-testid="upload-image-label"
              >
                <FiCamera size={16} color="var(--navy-900)" />
              </label>
              <input 
                type="file" 
                id="profile-image-input"
                data-testid="profile-image-input"
                ref={fileInputRef} 
                onChange={handleImageChange} 
                accept="image/*" 
                style={{ 
                  position: 'absolute',
                  width: '1px', height: '1px',
                  padding: '0', margin: '-1px',
                  overflow: 'hidden', clip: 'rect(0,0,0,0)',
                  border: '0'
                }} 
              />
            </div>

            <h3 style={{ fontWeight: 700, fontSize: '1.125rem', marginBottom: '0.25rem' }}>{formData.name || 'User Name'}</h3>
            <p style={{ color: 'var(--text-muted)', fontSize: '0.875rem', marginBottom: '1.5rem' }}>Testing Student</p>

            <div style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem' }}>
              <div style={{ 
                padding: '0.75rem', borderRadius: '12px', background: 'var(--bg-base)',
                fontSize: '0.8125rem', color: 'var(--text-secondary)', textAlign: 'left'
              }}>
                <p style={{ fontWeight: 700, marginBottom: '2px', color: 'var(--text-primary)' }}>Account Type</p>
                Student Academic Account
              </div>

              {/* Wallet Section */}
              <div style={{ 
                padding: '1rem', borderRadius: '12px', 
                background: 'rgba(22, 163, 74, 0.05)', 
                border: '1px solid rgba(22, 163, 74, 0.15)',
                textAlign: 'left'
              }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '0.5rem' }}>
                  <p style={{ fontWeight: 700, fontSize: '0.8125rem', color: '#16a34a' }}>Wallet Balance</p>
                  <span style={{ fontSize: '1.125rem' }}>💰</span>
                </div>
                <p className="num" style={{ fontSize: '1.5rem', fontWeight: 800, color: '#16a34a', marginBottom: '0.75rem' }}>
                  ₹{(wallet || 0).toLocaleString()}
                </p>
                <button 
                  onClick={() => setIsTopUpOpen(true)}
                  className="btn btn-primary btn-sm" 
                  style={{ width: '100%', background: '#16a34a', color: 'white', boxShadow: '0 4px 12px rgba(22, 163, 74, 0.2)' }}
                >
                  + Add Money
                </button>
              </div>

              <button 
                onClick={logout}
                className="btn btn-danger" 
                style={{ width: '100%' }}
              >
                Sign Out
              </button>
            </div>
          </div>

          {/* Right Column: Form */}
          <div className="card" style={{ padding: '2.5rem' }}>
            <form onSubmit={handleSubmit}>
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1.5rem' }}>
                {/* Full Name */}
                <div style={{ gridColumn: 'span 2' }}>
                  <label className="input-label">Full Name</label>
                  <div className="input-wrap">
                    <FiUser className="input-icon input-icon-left" />
                    <input 
                      type="text"
                      name="name"
                      placeholder="Enter your name (Alpha only)"
                      className={`input-field has-icon-left ${errors.name ? 'error' : ''}`}
                      value={formData.name}
                      onChange={handleChange}
                    />
                    {errors.name && (
                      <p style={{ color: 'var(--error-text)', fontSize: '0.75rem', marginTop: '0.25rem', display: 'flex', alignItems: 'center', gap: '4px' }}>
                        <FiAlertCircle size={12} /> {errors.name}
                      </p>
                    )}
                  </div>
                </div>

                {/* Email Address */}
                <div style={{ gridColumn: 'span 2' }}>
                  <label className="input-label">Email Address</label>
                  <div className="input-wrap">
                    <FiMail className="input-icon input-icon-left" />
                    <input 
                      type="email"
                      name="email"
                      placeholder="name@example.com"
                      className={`input-field has-icon-left has-icon-right ${errors.email ? 'error' : ''}`}
                      value={formData.email}
                      onChange={handleChange}
                    />
                    <div className="input-icon input-icon-right">
                      {getEmailProviderIcon(formData.email)}
                    </div>
                    {errors.email && (
                      <p style={{ color: 'var(--error-text)', fontSize: '0.75rem', marginTop: '0.25rem', display: 'flex', alignItems: 'center', gap: '4px' }}>
                        <FiAlertCircle size={12} /> {errors.email}
                      </p>
                    )}
                  </div>
                </div>

                {/* Mobile Number */}
                <div>
                  <label className="input-label">Mobile Number</label>
                  <div className="input-wrap">
                    <FiPhone className="input-icon input-icon-left" />
                    <input 
                      type="tel"
                      name="mobile"
                      placeholder="10-digit number"
                      className={`input-field has-icon-left ${errors.mobile ? 'error' : ''}`}
                      value={formData.mobile}
                      onChange={handleChange}
                    />
                    {errors.mobile && (
                      <p style={{ color: 'var(--error-text)', fontSize: '0.75rem', marginTop: '0.25rem', display: 'flex', alignItems: 'center', gap: '4px' }}>
                        <FiAlertCircle size={12} /> {errors.mobile}
                      </p>
                    )}
                  </div>
                </div>

                {/* Date of Birth */}
                <div>
                  <label className="input-label">Date of Birth</label>
                  <div className="input-wrap">
                    <FiCalendar className="input-icon input-icon-left" style={{ zIndex: 1 }} />
                    <DatePicker
                      selected={formData.dob ? new Date(formData.dob) : null}
                      onChange={(date) => {
                        setFormData(prev => ({ ...prev, dob: date ? date.toISOString().split('T')[0] : '' }));
                        if (errors.dob) setErrors(prev => ({ ...prev, dob: '' }));
                      }}
                      dateFormat="yyyy-MM-dd"
                      maxDate={new Date()}
                      placeholderText="Select date of birth"
                      id="profile-dob-picker"
                      className={`input-field has-icon-left ${errors.dob ? 'error' : ''}`}
                      autoComplete="off"
                    />
                    {errors.dob && (
                      <p style={{ color: 'var(--error-text)', fontSize: '0.75rem', marginTop: '0.25rem', display: 'flex', alignItems: 'center', gap: '4px' }}>
                        <FiAlertCircle size={12} /> {errors.dob}
                      </p>
                    )}
                  </div>
                </div>
              </div>

              <div style={{ marginTop: '2.5rem', display: 'flex', gap: '1rem' }}>
                <button 
                  type="submit" 
                  disabled={isSubmitting}
                  className="btn btn-primary"
                  style={{ flex: 1, height: '48px' }}
                >
                  {isSubmitting ? 'Saving...' : 'Update Profile'}
                </button>
                <button 
                  type="button"
                  onClick={() => navigate('/dashboard')}
                  className="btn btn-secondary"
                  style={{ flex: 1, height: '48px' }}
                >
                  Cancel
                </button>
              </div>
            </form>
          </div>
        </div>
      </div>
    </div>
    </>
  );
};

export default ProfilePage;
