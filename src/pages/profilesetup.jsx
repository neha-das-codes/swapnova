// src/pages/profilesetup.jsx
import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../context/authcontext';
import api from '../services/api';
import { sendWelcomeEmail } from '../services/emailservice';

// Skill categories for suggestions
const SKILL_SUGGESTIONS = [
  'Web Development', 'Python', 'JavaScript', 'React', 'Node.js',
  'Graphic Design', 'UI/UX Design', 'Photoshop', 'Illustrator', 'Figma',
  'Video Editing', 'Photography', 'Content Writing', 'Copywriting', 'SEO',
  'Digital Marketing', 'Social Media', 'Data Analysis', 'Excel', 'SQL',
  'Machine Learning', 'AI', 'Mobile Development', 'Flutter', 'Android',
  'Music Production', 'Guitar', 'Piano', 'Singing', 'Dance',
  'Language Teaching', 'English', 'Hindi', 'Spanish', 'French',
  'Cooking', 'Fitness Training', 'Yoga', 'Public Speaking', 'Communication'
];

// Indian cities for autocomplete
const INDIAN_CITIES = [
  'Mumbai', 'Delhi', 'Bangalore', 'Hyderabad', 'Ahmedabad', 'Chennai',
  'Kolkata', 'Pune', 'Jaipur', 'Surat', 'Lucknow', 'Kanpur', 'Nagpur',
  'Indore', 'Thane', 'Bhopal', 'Visakhapatnam', 'Pimpri-Chinchwad',
  'Patna', 'Vadodara', 'Ghaziabad', 'Ludhiana', 'Agra', 'Nashik',
  'Faridabad', 'Meerut', 'Rajkot', 'Kalyan-Dombivali', 'Vasai-Virar',
  'Varanasi', 'Srinagar', 'Aurangabad', 'Dhanbad', 'Amritsar', 'Navi Mumbai',
  'Allahabad', 'Ranchi', 'Howrah', 'Coimbatore', 'Jabalpur', 'Gwalior'
];

// Common areas by city (sample data - you can expand this)
const CITY_AREAS = {
  'Mumbai': [
    'Andheri', 'Bandra', 'Borivali', 'Churchgate', 'Colaba', 'Dadar',
    'Goregaon', 'Juhu', 'Kandivali', 'Kurla', 'Malad', 'Mira Road',
    'Mulund', 'Navi Mumbai', 'Powai', 'Santacruz', 'Thane', 'Vile Parle',
    'Worli', 'Andheri East', 'Andheri West', 'Bandra East', 'Bandra West',
    'Borivali East', 'Borivali West','Bhayander East' ,'Bhayander West'
  ],
  'Delhi': [
    'Connaught Place', 'Karol Bagh', 'Lajpat Nagar', 'Dwarka', 'Rohini',
    'Janakpuri', 'Rajouri Garden', 'Saket', 'Vasant Kunj', 'Green Park',
    'Defence Colony', 'Greater Kailash', 'Nehru Place', 'Pitampura'
  ],
  'Bangalore': [
    'Koramangala', 'Indiranagar', 'Whitefield', 'Electronic City',
    'HSR Layout', 'BTM Layout', 'Jayanagar', 'Marathahalli', 'MG Road',
    'Yelahanka', 'JP Nagar', 'Sarjapur Road', 'Banashankari'
  ],
  'Pune': [
    'Kothrud', 'Hinjewadi', 'Viman Nagar', 'Koregaon Park', 'Aundh',
    'Baner', 'Wakad', 'Hadapsar', 'Magarpatta', 'Camp Area', 'Deccan'
  ],
  'Hyderabad': [
    'Hitech City', 'Gachibowli', 'Madhapur', 'Kukatpally', 'Miyapur',
    'Secunderabad', 'Banjara Hills', 'Jubilee Hills', 'Dilsukhnagar'
  ],
  'Chennai': [
    'T Nagar', 'Anna Nagar', 'Velachery', 'Adyar', 'Tambaram', 'OMR',
    'Guindy', 'Mylapore', 'Nungambakkam', 'Porur'
  ]
};

const ProfileSetup = () => {
  const navigate = useNavigate();
  const { currentUser } = useAuth();
  
  const [formData, setFormData] = useState({
    fullName: '',
    bio: '',
    city: '',
    area: '',
    skillsOffered: [],
    skillsNeeded: [],
    exchangeMode: '',
    availability: {
      days: [],
      time: []
    },
    socialLinks: {
      linkedin: '',
      portfolio: '',
      googleDrive: '',
      dropbox: ''
    }
  });

  const [newSkillOffer, setNewSkillOffer] = useState('');
  const [newSkillNeed, setNewSkillNeed] = useState('');
  const [showOfferSuggestions, setShowOfferSuggestions] = useState(false);
  const [showNeedSuggestions, setShowNeedSuggestions] = useState(false);
  const [showCitySuggestions, setShowCitySuggestions] = useState(false);
  const [showAreaSuggestions, setShowAreaSuggestions] = useState(false);
  const [errors, setErrors] = useState({});
  const [isLoading, setIsLoading] = useState(false);
  const [currentStep, setCurrentStep] = useState(1);

  const totalSteps = 3;

  // Handle input changes
  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData({ ...formData, [name]: value });
    if (errors[name]) {
      setErrors({ ...errors, [name]: '' });
    }
  };

  // Handle city change with autocomplete
  const handleCityChange = (e) => {
    const value = e.target.value;
    setFormData({ ...formData, city: value, area: '' }); // Reset area when city changes
    setShowCitySuggestions(true);
    if (errors.city) {
      setErrors({ ...errors, city: '' });
    }
  };

  // Handle area change with autocomplete
  const handleAreaChange = (e) => {
    const value = e.target.value;
    setFormData({ ...formData, area: value });
    setShowAreaSuggestions(true);
    if (errors.area) {
      setErrors({ ...errors, area: '' });
    }
  };

  // Select city from suggestions
  const selectCity = (city) => {
    setFormData({ ...formData, city, area: '' });
    setShowCitySuggestions(false);
  };

  // Select area from suggestions
  const selectArea = (area) => {
    setFormData({ ...formData, area });
    setShowAreaSuggestions(false);
  };

  // Filter city suggestions
  const filteredCities = INDIAN_CITIES.filter(city =>
    city.toLowerCase().includes(formData.city.toLowerCase())
  ).slice(0, 8);

  // Filter area suggestions based on selected city
  const filteredAreas = formData.city && CITY_AREAS[formData.city]
    ? CITY_AREAS[formData.city].filter(area =>
        area.toLowerCase().includes(formData.area.toLowerCase())
      ).slice(0, 8)
    : [];

  // Handle social links
  const handleSocialChange = (e) => {
    const { name, value } = e.target;
    setFormData({
      ...formData,
      socialLinks: { ...formData.socialLinks, [name]: value }
    });
  };

  // Add skill to offer
  const addSkillOffer = (skill) => {
    const trimmedSkill = skill.trim();
    if (trimmedSkill && !formData.skillsOffered.includes(trimmedSkill) && formData.skillsOffered.length < 5) {
      setFormData({
        ...formData,
        skillsOffered: [...formData.skillsOffered, trimmedSkill]
      });
      setNewSkillOffer('');
      setShowOfferSuggestions(false);
    }
  };

  // Remove skill from offer
  const removeSkillOffer = (skill) => {
    setFormData({
      ...formData,
      skillsOffered: formData.skillsOffered.filter(s => s !== skill)
    });
  };

  // Add skill to need
  const addSkillNeed = (skill) => {
    const trimmedSkill = skill.trim();
    if (trimmedSkill && !formData.skillsNeeded.includes(trimmedSkill) && formData.skillsNeeded.length < 5) {
      setFormData({
        ...formData,
        skillsNeeded: [...formData.skillsNeeded, trimmedSkill]
      });
      setNewSkillNeed('');
      setShowNeedSuggestions(false);
    }
  };

  // Remove skill from need
  const removeSkillNeed = (skill) => {
    setFormData({
      ...formData,
      skillsNeeded: formData.skillsNeeded.filter(s => s !== skill)
    });
  };

  // Handle availability days
  const toggleDay = (day) => {
    const days = formData.availability.days.includes(day)
      ? formData.availability.days.filter(d => d !== day)
      : [...formData.availability.days, day];
    setFormData({
      ...formData,
      availability: { ...formData.availability, days }
    });
  };

  // Handle availability time
  const toggleTime = (time) => {
    const times = formData.availability.time.includes(time)
      ? formData.availability.time.filter(t => t !== time)
      : [...formData.availability.time, time];
    setFormData({
      ...formData,
      availability: { ...formData.availability, time: times }
    });
  };

  // Filter suggestions
  const filteredOfferSuggestions = SKILL_SUGGESTIONS.filter(
    skill => skill.toLowerCase().includes(newSkillOffer.toLowerCase()) &&
    !formData.skillsOffered.includes(skill)
  ).slice(0, 5);

  const filteredNeedSuggestions = SKILL_SUGGESTIONS.filter(
    skill => skill.toLowerCase().includes(newSkillNeed.toLowerCase()) &&
    !formData.skillsNeeded.includes(skill)
  ).slice(0, 5);

  // Validate current step
  const validateStep = (step) => {
    const newErrors = {};

    if (step === 1) {
      if (!formData.fullName.trim()) {
        newErrors.fullName = 'Full name is required';
      }
      if (!formData.city.trim()) {
        newErrors.city = 'City is required';
      }
      if (!formData.area.trim()) {
        newErrors.area = 'Area is required';
      }
    }

    if (step === 2) {
      if (formData.skillsOffered.length === 0) {
        newErrors.skillsOffered = 'Add at least one skill you can offer';
      }
      if (formData.skillsNeeded.length === 0) {
        newErrors.skillsNeeded = 'Add at least one skill you want to learn';
      }
    }

    if (step === 3) {
      if (!formData.exchangeMode) {
        newErrors.exchangeMode = 'Please select your preferred mode';
      }
      if (formData.availability.days.length === 0) {
        newErrors.availabilityDays = 'Select at least one day';
      }
      if (formData.availability.time.length === 0) {
        newErrors.availabilityTime = 'Select at least one time slot';
      }
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  // Go to next step
  const nextStep = () => {
    if (validateStep(currentStep)) {
      setCurrentStep(currentStep + 1);
    }
  };

  // Go to previous step
  const prevStep = () => {
    setCurrentStep(currentStep - 1);
  };
// Submit form - SAVE TO BOTH BACKEND AND FIREBASE + SEND WELCOME EMAIL
const handleSubmit = async (e) => {
  e.preventDefault();
  
  if (!validateStep(currentStep)) return;

  setIsLoading(true);
  setErrors({});

  try {
    // Import Firebase function
    const { updateUserData } = await import('../firebase/auth');
    
    // Prepare data
    const profileData = {
      fullName: formData.fullName,
      email: currentUser.email,
      phone: currentUser.phoneNumber || '+911234567890',
      skillsOffered: formData.skillsOffered,
      skillsNeeded: formData.skillsNeeded,
      location: {
        city: formData.city,
        area: formData.area
      },
      exchangeMode: formData.exchangeMode,
      availability: formData.availability,
      bio: formData.bio || '',
      socialLinks: formData.socialLinks,
      profileCompleted: true,
      createdAt: Date.now() // ✅ Add creation timestamp
    };

    console.log('📤 Saving profile for UID:', currentUser.uid);
    console.log('📦 Profile data:', profileData);

    // ✅ STEP 1: Save to Backend (for AI matching)
    try {
      console.log('🔄 Calling backend API...');
      const backendResult = await api.user.updateUser(currentUser.uid, profileData);
      console.log('✅ Backend saved successfully:', backendResult);
    } catch (backendError) {
      console.warn('⚠️ Backend API failed, but continuing with Firebase:', backendError);
    }

    // ✅ STEP 2: Save to Firebase (source of truth)
    console.log('🔄 Saving to Firebase...');
    const firebaseResult = await updateUserData(currentUser.uid, profileData);
    console.log('✅ Firebase result:', firebaseResult);
    
    if (firebaseResult.success) {
      // ✅ STEP 3: Send welcome email
      console.log('📧 Sending welcome email...');
      try {
        await sendWelcomeEmail({
          email: currentUser.email,
          fullName: formData.fullName
        });
        console.log('✅ Welcome email sent successfully');
      } catch (emailError) {
        console.warn('⚠️ Welcome email failed (non-critical):', emailError);
        // Don't fail profile creation if email fails
      }

      setIsLoading(false);
      console.log('✅ Profile completed! Redirecting to dashboard...');
      navigate('/dashboard');
    } else {
      console.error('❌ Firebase save failed:', firebaseResult.error);
      setIsLoading(false);
      setErrors({ submit: firebaseResult.error || 'Failed to save profile' });
    }
    
  } catch (error) {
    console.error('❌ Critical error:', error);
    setIsLoading(false);
    setErrors({ submit: error.message || 'Failed to save profile. Please try again.' });
  }
};
  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 to-primary-50 pt-20 pb-12 px-4">
      <div className="container-custom max-w-2xl mx-auto">
        {/* Header */}
        <div className="text-center mb-8">
          <h1 className="text-3xl sm:text-4xl font-bold text-gray-900 mb-2">
            Complete Your Profile ✨
          </h1>
          <p className="text-gray-600">
            Tell us about your skills and what you want to learn
          </p>
        </div>

        {/* Progress Bar */}
        <div className="mb-8">
          <div className="flex justify-between mb-2">
            {[1, 2, 3].map((step) => (
              <div
                key={step}
                className={`flex items-center justify-center w-10 h-10 rounded-full font-semibold transition-all ${
                  step <= currentStep
                    ? 'bg-primary-500 text-white'
                    : 'bg-gray-200 text-gray-500'
                }`}
              >
                {step < currentStep ? (
                  <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                  </svg>
                ) : (
                  step
                )}
              </div>
            ))}
          </div>
          <div className="h-2 bg-gray-200 rounded-full">
            <div
              className="h-full bg-gradient-primary rounded-full transition-all duration-500"
              style={{ width: `${(currentStep / totalSteps) * 100}%` }}
            />
          </div>
          <div className="flex justify-between mt-2 text-sm text-gray-500">
            <span>Basic Info</span>
            <span>Skills</span>
            <span>Preferences</span>
          </div>
        </div>

        {/* Form Card */}
        <div className="bg-white rounded-3xl shadow-card p-6 sm:p-8">
          <form onSubmit={handleSubmit}>
            
            {/* Step 1: Basic Information */}
            {currentStep === 1 && (
              <div className="space-y-6 animate-fadeIn">
                <h2 className="text-xl font-semibold text-gray-800 mb-4">
                  📝 Basic Information
                </h2>

                {/* Full Name */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Full Name <span className="text-red-500">*</span>
                  </label>
                  <input
                    type="text"
                    name="fullName"
                    value={formData.fullName}
                    onChange={handleChange}
                    placeholder="Enter your full name"
                    className={`w-full px-4 py-3 border-2 rounded-xl focus:outline-none transition-colors ${
                      errors.fullName
                        ? 'border-red-300 focus:border-red-500'
                        : 'border-gray-200 focus:border-primary-500'
                    }`}
                  />
                  {errors.fullName && (
                    <p className="text-red-500 text-sm mt-1">{errors.fullName}</p>
                  )}
                </div>

                {/* Bio */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Bio <span className="text-gray-400">(Optional)</span>
                  </label>
                  <textarea
                    name="bio"
                    value={formData.bio}
                    onChange={handleChange}
                    placeholder="Tell others about yourself in a few words..."
                    rows={3}
                    maxLength={200}
                    className="w-full px-4 py-3 border-2 border-gray-200 rounded-xl focus:outline-none focus:border-primary-500 transition-colors resize-none"
                  />
                  <p className="text-gray-400 text-xs text-right mt-1">
                    {formData.bio.length}/200 characters
                  </p>
                </div>

                {/* Location with Autocomplete */}
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  {/* City */}
                  <div className="relative">
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      City <span className="text-red-500">*</span>
                    </label>
                    <input
                      type="text"
                      name="city"
                      value={formData.city}
                      onChange={handleCityChange}
                      onFocus={() => setShowCitySuggestions(true)}
                      onBlur={() => setTimeout(() => setShowCitySuggestions(false), 200)}
                      placeholder="e.g., Mumbai"
                      className={`w-full px-4 py-3 border-2 rounded-xl focus:outline-none transition-colors ${
                        errors.city
                          ? 'border-red-300 focus:border-red-500'
                          : 'border-gray-200 focus:border-primary-500'
                      }`}
                    />
                    {errors.city && (
                      <p className="text-red-500 text-sm mt-1">{errors.city}</p>
                    )}
                    
                    {/* City Suggestions Dropdown */}
                    {showCitySuggestions && formData.city && filteredCities.length > 0 && (
                      <div className="absolute z-20 w-full mt-1 bg-white border border-gray-200 rounded-xl shadow-lg max-h-48 overflow-y-auto">
                        {filteredCities.map((city) => (
                          <button
                            key={city}
                            type="button"
                            onClick={() => selectCity(city)}
                            className="w-full px-4 py-2.5 text-left hover:bg-primary-50 text-sm flex items-center gap-2"
                          >
                            <span className="text-primary-500">📍</span>
                            {city}
                          </button>
                        ))}
                      </div>
                    )}
                  </div>

                  {/* Area */}
                  <div className="relative">
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Area <span className="text-red-500">*</span>
                    </label>
                    <input
                      type="text"
                      name="area"
                      value={formData.area}
                      onChange={handleAreaChange}
                      onFocus={() => setShowAreaSuggestions(true)}
                      onBlur={() => setTimeout(() => setShowAreaSuggestions(false), 200)}
                      placeholder="e.g., Andheri West"
                      disabled={!formData.city}
                      className={`w-full px-4 py-3 border-2 rounded-xl focus:outline-none transition-colors ${
                        errors.area
                          ? 'border-red-300 focus:border-red-500'
                          : 'border-gray-200 focus:border-primary-500'
                      } ${!formData.city ? 'bg-gray-100 cursor-not-allowed' : ''}`}
                    />
                    {errors.area && (
                      <p className="text-red-500 text-sm mt-1">{errors.area}</p>
                    )}
                    {!formData.city && (
                      <p className="text-gray-400 text-xs mt-1">Select a city first</p>
                    )}
                    
                    {/* Area Suggestions Dropdown */}
                    {showAreaSuggestions && formData.area && filteredAreas.length > 0 && (
                      <div className="absolute z-20 w-full mt-1 bg-white border border-gray-200 rounded-xl shadow-lg max-h-48 overflow-y-auto">
                        {filteredAreas.map((area) => (
                          <button
                            key={area}
                            type="button"
                            onClick={() => selectArea(area)}
                            className="w-full px-4 py-2.5 text-left hover:bg-primary-50 text-sm flex items-center gap-2"
                          >
                            <span className="text-primary-500">📌</span>
                            {area}
                          </button>
                        ))}
                      </div>
                    )}
                  </div>
                </div>
              </div>
            )}

            {/* Step 2: Skills - SAME AS BEFORE */}
            {currentStep === 2 && (
              <div className="space-y-6 animate-fadeIn">
                <h2 className="text-xl font-semibold text-gray-800 mb-4">
                  🎓 Your Skills
                </h2>

                {/* Skills I Can Offer */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Skills I Can Teach 📚 <span className="text-red-500">*</span>
                    <span className="text-gray-400 font-normal ml-2">(Max 5)</span>
                  </label>
                  <div className="border-2 border-dashed border-green-200 bg-green-50/30 rounded-xl p-4">
                    {/* Added Skills */}
                    <div className="flex flex-wrap gap-2 mb-3">
                      {formData.skillsOffered.map((skill) => (
                        <span
                          key={skill}
                          className="inline-flex items-center gap-1 px-3 py-1.5 bg-green-100 text-green-700 rounded-full text-sm font-medium"
                        >
                          {skill}
                          <button
                            type="button"
                            onClick={() => removeSkillOffer(skill)}
                            className="hover:text-green-900"
                          >
                            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                            </svg>
                          </button>
                        </span>
                      ))}
                      {formData.skillsOffered.length === 0 && (
                        <span className="text-gray-400 text-sm">No skills added yet</span>
                      )}
                    </div>
                    
                    {/* Add Skill Input */}
                    {formData.skillsOffered.length < 5 && (
                      <div className="relative">
                        <input
                          type="text"
                          value={newSkillOffer}
                          onChange={(e) => {
                            setNewSkillOffer(e.target.value);
                            setShowOfferSuggestions(true);
                          }}
                          onFocus={() => setShowOfferSuggestions(true)}
                          onBlur={() => setTimeout(() => setShowOfferSuggestions(false), 200)}
                          onKeyDown={(e) => {
                            if (e.key === 'Enter') {
                              e.preventDefault();
                              addSkillOffer(newSkillOffer);
                            }
                          }}
                          placeholder="Type a skill and press Enter (or select from suggestions)"
                          className="w-full px-4 py-2 border border-gray-200 rounded-lg focus:outline-none focus:border-green-500 bg-white"
                        />
                        
                        {/* Suggestions Dropdown */}
                        {showOfferSuggestions && newSkillOffer && filteredOfferSuggestions.length > 0 && (
                          <div className="absolute z-10 w-full mt-1 bg-white border border-gray-200 rounded-lg shadow-lg max-h-40 overflow-y-auto">
                            {filteredOfferSuggestions.map((skill) => (
                              <button
                                key={skill}
                                type="button"
                                onClick={() => addSkillOffer(skill)}
                                className="w-full px-4 py-2 text-left hover:bg-green-50 text-sm"
                              >
                                {skill}
                              </button>
                            ))}
                          </div>
                        )}
                      </div>
                    )}
                  </div>
                  {errors.skillsOffered && (
                    <p className="text-red-500 text-sm mt-1">{errors.skillsOffered}</p>
                  )}
                </div>

                {/* Skills I Need */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Skills I Want to Learn 🌟 <span className="text-red-500">*</span>
                    <span className="text-gray-400 font-normal ml-2">(Max 5)</span>
                  </label>
                  <div className="border-2 border-dashed border-blue-200 bg-blue-50/30 rounded-xl p-4">
                    {/* Added Skills */}
                    <div className="flex flex-wrap gap-2 mb-3">
                      {formData.skillsNeeded.map((skill) => (
                        <span
                          key={skill}
                          className="inline-flex items-center gap-1 px-3 py-1.5 bg-blue-100 text-blue-700 rounded-full text-sm font-medium"
                        >
                          {skill}
                          <button
                            type="button"
                            onClick={() => removeSkillNeed(skill)}
                            className="hover:text-blue-900"
                          >
                            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                            </svg>
                          </button>
                        </span>
                      ))}
                      {formData.skillsNeeded.length === 0 && (
                        <span className="text-gray-400 text-sm">No skills added yet</span>
                      )}
                    </div>
                    
                    {/* Add Skill Input */}
                    {formData.skillsNeeded.length < 5 && (
                      <div className="relative">
                        <input
                          type="text"
                          value={newSkillNeed}
                          onChange={(e) => {
                            setNewSkillNeed(e.target.value);
                            setShowNeedSuggestions(true);
                          }}
                          onFocus={() => setShowNeedSuggestions(true)}
                          onBlur={() => setTimeout(() => setShowNeedSuggestions(false), 200)}
                          onKeyDown={(e) => {
                            if (e.key === 'Enter') {
                              e.preventDefault();
                              addSkillNeed(newSkillNeed);
                            }
                          }}
                          placeholder="Type a skill and press Enter (or select from suggestions)"
                          className="w-full px-4 py-2 border border-gray-200 rounded-lg focus:outline-none focus:border-blue-500 bg-white"
                        />
                        
                        {/* Suggestions Dropdown */}
                        {showNeedSuggestions && newSkillNeed && filteredNeedSuggestions.length > 0 && (
                          <div className="absolute z-10 w-full mt-1 bg-white border border-gray-200 rounded-lg shadow-lg max-h-40 overflow-y-auto">
                            {filteredNeedSuggestions.map((skill) => (
                              <button
                                key={skill}
                                type="button"
                                onClick={() => addSkillNeed(skill)}
                                className="w-full px-4 py-2 text-left hover:bg-blue-50 text-sm"
                              >
                                {skill}
                              </button>
                            ))}
                            </div>
                    )}
                  </div>
                )}
              </div>
              {errors.skillsNeeded && (
                <p className="text-red-500 text-sm mt-1">{errors.skillsNeeded}</p>
              )}
            </div>
          </div>
        )}

        {/* Step 3: Preferences - SAME AS BEFORE */}
        {currentStep === 3 && (
          <div className="space-y-6 animate-fadeIn">
            <h2 className="text-xl font-semibold text-gray-800 mb-4">
              ⚙️ Preferences
            </h2>

            {/* Exchange Mode */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-3">
                Exchange Mode <span className="text-red-500">*</span>
              </label>
              <div className="flex flex-wrap gap-3">
                {[
                  { label: '🌐 Online', value: 'Online' },
                  { label: '📍 Offline', value: 'Offline' },
                  { label: '🔄 Both', value: 'Both' }
                ].map(({ label, value }) => (
                  <button
                    key={value}
                    type="button"
                    onClick={() => setFormData({ ...formData, exchangeMode: value })}
                    className={`flex-1 min-w-[120px] p-4 rounded-xl font-medium transition-all text-left ${
                      formData.exchangeMode === value
                        ? 'bg-primary-500 text-white shadow-md'
                        : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
                    }`}
                  >
                    <div className="text-base">{label}</div>
                  </button>
                ))}
              </div>
              {errors.exchangeMode && (
                <p className="text-red-500 text-sm mt-1">{errors.exchangeMode}</p>
              )}
            </div>

            {/* Availability - Days */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-3">
                Available Days <span className="text-red-500">*</span>
              </label>
              <div className="flex flex-wrap gap-2">
                {['Weekdays', 'Weekends', 'All Days'].map((day) => (
                  <button
                    key={day}
                    type="button"
                    onClick={() => toggleDay(day)}
                    className={`px-5 py-2.5 rounded-xl font-medium transition-all ${
                      formData.availability.days.includes(day)
                        ? 'bg-primary-500 text-white'
                        : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
                    }`}
                  >
                    {day}
                  </button>
                ))}
              </div>
              {errors.availabilityDays && (
                <p className="text-red-500 text-sm mt-1">{errors.availabilityDays}</p>
              )}
            </div>

            {/* Availability - Time */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-3">
                Preferred Time <span className="text-red-500">*</span>
              </label>
              <div className="flex flex-wrap gap-2">
                {[
                  { label: '🌅 Morning', value: 'Morning' },
                  { label: '☀️ Afternoon', value: 'Afternoon' },
                  { label: '🌆 Evening', value: 'Evening' }
                ].map(({ label, value }) => (
                  <button
                    key={value}
                    type="button"
                    onClick={() => toggleTime(value)}
                    className={`px-4 py-2.5 rounded-xl font-medium transition-all text-sm ${
                      formData.availability.time.includes(value)
                        ? 'bg-primary-500 text-white'
                        : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
                    }`}
                  >
                    {label}
                  </button>
                ))}
              </div>
              {errors.availabilityTime && (
                <p className="text-red-500 text-sm mt-1">{errors.availabilityTime}</p>
              )}
            </div>

            {/* Social/Portfolio Links (Optional) */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-3">
                Portfolio & Social Links <span className="text-gray-400">(Optional)</span>
              </label>
              <p className="text-gray-500 text-sm mb-3">
                Add links to showcase your work or connect professionally
              </p>
              <div className="space-y-3">
                {/* LinkedIn */}
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 bg-blue-100 rounded-lg flex items-center justify-center flex-shrink-0">
                    <span className="text-lg">💼</span>
                  </div>
                  <div className="flex-1">
                    <input
                      type="url"
                      name="linkedin"
                      value={formData.socialLinks.linkedin}
                      onChange={handleSocialChange}
                      placeholder="LinkedIn profile URL"
                      className="w-full px-4 py-2.5 border border-gray-200 rounded-xl focus:outline-none focus:border-primary-500"
                    />
                  </div>
                </div>
                
                {/* Portfolio / Website */}
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 bg-purple-100 rounded-lg flex items-center justify-center flex-shrink-0">
                    <span className="text-lg">🌐</span>
                  </div>
                  <div className="flex-1">
                    <input
                      type="url"
                      name="portfolio"
                      value={formData.socialLinks.portfolio}
                      onChange={handleSocialChange}
                      placeholder="Portfolio / Website / GitHub URL"
                      className="w-full px-4 py-2.5 border border-gray-200 rounded-xl focus:outline-none focus:border-primary-500"
                    />
                  </div>
                </div>
                
                {/* Google Drive Link */}
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 bg-green-100 rounded-lg flex items-center justify-center flex-shrink-0">
                    <span className="text-lg">📁</span>
                  </div>
                  <div className="flex-1">
                    <input
                      type="url"
                      name="googleDrive"
                      value={formData.socialLinks.googleDrive}
                      onChange={handleSocialChange}
                      placeholder="Google Drive link"
                      className="w-full px-4 py-2.5 border border-gray-200 rounded-xl focus:outline-none focus:border-primary-500"
                    />
                  </div>
                </div>
                
                {/* Dropbox Link */}
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 bg-blue-50 rounded-lg flex items-center justify-center flex-shrink-0">
                    <span className="text-lg">📦</span>
                  </div>
                  <div className="flex-1">
                    <input
                      type="url"
                      name="dropbox"
                      value={formData.socialLinks.dropbox}
                      onChange={handleSocialChange}
                      placeholder="Dropbox link"
                      className="w-full px-4 py-2.5 border border-gray-200 rounded-xl focus:outline-none focus:border-primary-500"
                    />
                  </div>
                </div>
              </div>
              <p className="text-gray-400 text-xs mt-2">
                💡 Tip: Make sure your Google Drive / Dropbox links have public sharing enabled
              </p>
            </div>
          </div>
        )}

        {/* Error Message */}
        {errors.submit && (
          <div className="mt-4 p-3 bg-red-50 border border-red-200 rounded-xl text-red-600 text-sm">
            {errors.submit}
          </div>
        )}
          {/* Navigation Buttons */}
            <div className="flex justify-between mt-8 pt-6 border-t border-gray-100">
              {currentStep > 1 ? (
                <button
                  type="button"
                  onClick={prevStep}
                  className="px-6 py-3 text-gray-600 font-medium hover:text-gray-800 transition-colors flex items-center gap-2"
                >
                  <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
                  </svg>
                  Back
                </button>
              ) : (
                <div></div>
              )}

              {currentStep < totalSteps ? (
                <button
                  type="button"
                  onClick={nextStep}
                  className="px-8 py-3 bg-gradient-primary text-white font-semibold rounded-xl hover:shadow-glow transition-all flex items-center gap-2"
                >
                  Next
                  <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                  </svg>
                </button>
              ) : (
                <button
                  type="submit"
                  disabled={isLoading}
                  className={`px-8 py-3 font-semibold rounded-xl transition-all flex items-center gap-2 ${
                    isLoading
                      ? 'bg-gray-300 cursor-not-allowed text-gray-500'
                      : 'bg-gradient-to-r from-green-500 to-emerald-600 text-white hover:shadow-lg hover:-translate-y-0.5'
                  }`}
                >
                  {isLoading ? (
                    <>
                      <svg className="animate-spin w-5 h-5" fill="none" viewBox="0 0 24 24">
                        <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                        <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                      </svg>
                      Creating Profile...
                    </>
                  ) : (
                    <>
                      <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                      </svg>
                      Complete Profile
                    </>
                  )}
                </button>
              )}
            </div>
          </form>
        </div>
      </div>
    </div>
  );
};

export default ProfileSetup;