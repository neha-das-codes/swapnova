import { 
  createUserWithEmailAndPassword,
  signInWithEmailAndPassword,
  signOut,
  sendPasswordResetEmail,
  GoogleAuthProvider,
  signInWithPopup
} from 'firebase/auth';
import { ref, set, get, update } from 'firebase/database';
import { auth, database } from './config';

// ==================== USER SIGNUP ====================
export const signUpWithEmail = async (email, password) => {
  try {
    // Create user in Firebase Auth
    const userCredential = await createUserWithEmailAndPassword(auth, email, password);
    const user = userCredential.user;

    // Create user data in Realtime Database
    const userData = {
      uid: user.uid,
      email: email,
      role: 'user',
      profileCompleted: false,
      createdAt: Date.now(),
      updatedAt: Date.now()
    };

    // Save to database
    await set(ref(database, `users/${user.uid}`), userData);

    return { success: true, user, userData };
  } catch (error) {
    console.error('Signup error:', error);
    return { success: false, error: getErrorMessage(error.code) };
  }
};

// ==================== USER SIGNIN ====================
export const signInWithEmail = async (email, password) => {
  try {
    const userCredential = await signInWithEmailAndPassword(auth, email, password);
    const user = userCredential.user;

    // Get user data from database
    const userRef = ref(database, `users/${user.uid}`);
    const snapshot = await get(userRef);
    
    if (snapshot.exists()) {
      const userData = snapshot.val();
      return { success: true, user, userData };
    } else {
      return { success: true, user, userData: null };
    }
  } catch (error) {
    console.error('Signin error:', error);
    return { success: false, error: getErrorMessage(error.code) };
  }
};

// ==================== GOOGLE SIGN-IN ====================
export const signInWithGoogle = async () => {
  try {
    const provider = new GoogleAuthProvider();
    const result = await signInWithPopup(auth, provider);
    const user = result.user;

    // Check if user exists in database
    const userRef = ref(database, `users/${user.uid}`);
    const snapshot = await get(userRef);

    if (snapshot.exists()) {
      // User exists, return their data
      const userData = snapshot.val();
      return { success: true, user, userData };
    } else {
      // New user, create profile
      const userData = {
        uid: user.uid,
        email: user.email,
        displayName: user.displayName || '',
        photoURL: user.photoURL || '',
        role: 'user',
        profileCompleted: false,
        createdAt: Date.now(),
        updatedAt: Date.now()
      };

      await set(userRef, userData);
      return { success: true, user, userData, isNewUser: true };
    }
  } catch (error) {
    console.error('Google sign-in error:', error);
    return { success: false, error: getErrorMessage(error.code) };
  }
};

// ==================== SIGNOUT ====================
export const logOut = async () => {
  try {
    await signOut(auth);
    return { success: true };
  } catch (error) {
    console.error('Logout error:', error);
    return { success: false, error: error.message };
  }
};

// ==================== PASSWORD RESET ====================
export const resetPassword = async (email) => {
  try {
    await sendPasswordResetEmail(auth, email);
    return { success: true };
  } catch (error) {
    console.error('Password reset error:', error);
    return { success: false, error: getErrorMessage(error.code) };
  }
};

// ==================== USER DATA FUNCTIONS ====================
export const getUserData = async (uid) => {
  try {
    const userRef = ref(database, `users/${uid}`);
    const snapshot = await get(userRef);
    
    if (snapshot.exists()) {
      return { success: true, data: snapshot.val() };
    }
    return { success: false, error: 'User not found' };
  } catch (error) {
    console.error('Get user data error:', error);
    return { success: false, error: error.message };
  }
};

export const updateUserData = async (uid, data) => {
  try {
    const userRef = ref(database, `users/${uid}`);
    await update(userRef, {
      ...data,
      updatedAt: Date.now()
    });
    return { success: true };
  } catch (error) {
    console.error('Update user data error:', error);
    return { success: false, error: error.message };
  }
};

export const getUserRole = async (uid) => {
  try {
    const userRef = ref(database, `users/${uid}/role`);
    const snapshot = await get(userRef);
    
    if (snapshot.exists()) {
      return snapshot.val();
    }
    return 'user';
  } catch (error) {
    console.error('Get user role error:', error);
    return 'user';
  }
};

// ==================== ERROR MESSAGES ====================
const getErrorMessage = (errorCode) => {
  switch (errorCode) {
    case 'auth/email-already-in-use':
      return 'This email is already registered. Please sign in.';
    case 'auth/invalid-email':
      return 'Invalid email address.';
    case 'auth/weak-password':
      return 'Password should be at least 8 characters.';
    case 'auth/user-not-found':
      return 'No account found with this email.';
    case 'auth/wrong-password':
      return 'Incorrect password. Please try again.';
    case 'auth/too-many-requests':
      return 'Too many attempts. Please try again later.';
    case 'auth/popup-closed-by-user':
      return 'Sign-in cancelled. Please try again.';
    case 'auth/account-exists-with-different-credential':
      return 'An account already exists with this email.';
    default:
      return 'An error occurred. Please try again.';
  }
};