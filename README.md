# SwapNova : AI-Based Skill Exchange Platform

A web application enabling two-way skill exchanges between users through AI-powered matching, real-time chat, and automated email notifications.

## Features

- **User Authentication:** Secure registration and login using email/password via Firebase Authentication.
- **3-Step Profile Setup:** Users fill basic info, list skills offered and needed, and set exchange preferences.
- **AI Matching Engine:** Matches users based on mutual skills, location, availability, and exchange mode with a compatibility percentage.
- **Trending Skill Suggestions:** Platform-wide AI analysis of most in-demand skills shown via notification bell.
- **Real-Time Chat:** Direct messaging between matched users using Firebase Realtime Database.
- **Google Meet Integration:** Google Meet links are directly shared through emails for virtual skill sessions.
- **Mark Complete & Feedback:** Both users mark exchange as complete, followed by a feedback and report form.
- **Admin Dashboard:** Monitor all exchanges, feedbacks, and reports across the platform.
- **Email Notifications:** Automated emails for connections, exchanges, and reports via EmailJS.
- **Responsive Design:** Optimized for desktop and mobile devices.

## Technology Stack

**Frontend:**
- React.js
- Tailwind CSS for styling
- Leaflet Maps for location-based area selection

**Backend & Services:**
- FastAPI (Python 3.10)
- Scikit-learn for AI matching and AI skill suggestion engine
- Firebase Authentication
- Firebase Realtime Database
- Firebase Storage
- Firebase Hosting (Frontend)
- Render (Backend)
- EmailJS for email notifications
- Google Meet for virtual skill sessions

## Live Demo

URL: https://swapnova-22d39.web.app

## Author

Neha Das

## Repository

https://github.com/neha-das-codes/swapnova
