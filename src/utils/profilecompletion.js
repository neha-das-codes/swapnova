/**
 * Calculate profile completion percentage
 * Used across Dashboard, MyProfile, UserProfile
 * 
 * Total: 100%
 * Required fields: 86% (6 fields × 14.33% each)
 * Optional fields: 14% (2 fields × 7% each)
 */
export const calculateProfileCompletion = (userData) => {
  if (!userData) return 0;
  
  let completed = 0;
  const requiredFields = 6;
  
  // Required fields (86% total)
  if (userData.fullName && userData.fullName.trim()) completed++;
  if (userData.location?.city && userData.location?.area) completed++;
  if (userData.skillsOffered?.length > 0) completed++;
  if (userData.skillsNeeded?.length > 0) completed++;
  if (userData.exchangeMode) completed++;
  if (userData.availability?.days?.length > 0 && userData.availability?.time?.length > 0) completed++;
  
  // Calculate percentage from required fields (max 86%)
  let percentage = Math.round((completed / requiredFields) * 86);
  
  // Optional fields (14% total)
  if (userData.bio && userData.bio.trim() !== '') percentage += 7;
  
  // Check if any social link is filled
  const hasSocialLinks = userData.socialLinks && Object.values(userData.socialLinks).some(
    link => link && link.trim() !== ''
  );
  if (hasSocialLinks) percentage += 7;
  
  return Math.min(percentage, 100);
};

/**
 * Get completion status with color
 */
export const getCompletionStatus = (percentage) => {
  if (percentage === 100) return { text: 'Complete', color: 'green' };
  if (percentage >= 70) return { text: 'Almost there', color: 'blue' };
  if (percentage >= 40) return { text: 'In progress', color: 'yellow' };
  return { text: 'Just started', color: 'gray' };
};

/**
 * Get missing required fields
 */
export const getMissingFields = (userData) => {
  const missing = [];
  
  if (!userData?.fullName) missing.push('Full Name');
  if (!userData?.location?.city || !userData?.location?.area) missing.push('Location (City & Area)');
  if (!userData?.skillsOffered?.length) missing.push('Skills You Offer');
  if (!userData?.skillsNeeded?.length) missing.push('Skills You Need');
  if (!userData?.exchangeMode) missing.push('Exchange Mode');
  if (!userData?.availability?.days?.length || !userData?.availability?.time?.length) {
    missing.push('Availability');
  }
  
  return missing;
};