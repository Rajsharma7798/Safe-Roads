# Safe Roads - Implementation Plan

This document outlines the systematic implementation strategy executed to develop the Safe Roads civic-tech platform module by module.

## Phase 1: Planning and Architecture
1. **Requirement Gathering**: Identified the core need for an accident prevention platform focused on potholes and faulty traffic lights. 
2. **Technology Selection**: 
   - Node.js/Express for a lightweight backend.
   - HTML/CSS/Bootstrap for a responsive, modern frontend.
   - Leaflet.js for mapping (chosen over Google Maps to prevent billing/API key issues).
   - Firebase Firestore for scalable NoSQL data storage.

## Phase 2: Frontend UI/UX Development
1. **Global Styles**: Implemented a clean "Light Mode" civic-tech aesthetic using Bootstrap 5 and custom CSS (`style.css`).
2. **Interactive Elements**: Used FontAwesome for iconography and designed a highly responsive interface suitable for both mobile and desktop.
3. **Map Integration**: Embedded Leaflet.js. Set the default map view to coordinates `[18.4901, 74.0205]` representing Loni Kalbhor, Pune.
4. **Forms and Modals**: Created a floating Action Button (FAB) triggered modal for the hazard report form (handling both potholes and traffic lights) and a separate contact/feedback form.

## Phase 3: Backend & API Development
1. **Express Server Initialization**: Setup `server.js` listening on port 3000, serving static files from the `/public` directory.
2. **Payload Capacity**: Increased `express.json({ limit: '10mb' })` to safely allow Base64 image uploads directly from the frontend.
3. **API Endpoints**:
   - `POST /api/reports`: Handles incoming hazard reports (type, lat, lng, description, image).
   - `GET /api/all-hazards`: Fetches existing hazard data for the Leaflet map.
   - `POST /api/feedback`: Captures contact requests and feedback.

## Phase 4: Database Integration
1. **Mock Fallback System**: Implemented an in-memory mock database in `firebase.js` that seeds initial dummy reports across the Pune region (Hadapsar, Viman Nagar, Loni Kalbhor).
2. **Firebase SDK Integration**: Added `firebase-admin` functionality. The server attempts to read `/server/serviceAccountKey.json`. If present, it connects to live Firestore; if absent, it gracefully falls back to the Mock DB.

## Phase 5: Containerization & Deployment Prep
1. **Docker Integration**: Created a `Dockerfile` utilizing `node:18-alpine` for a tiny, efficient production image.
2. **Optimization**: Configured `.dockerignore` to prevent `node_modules` and sensitive API keys from being baked into the image.

## Phase 6: Future Roadmap
- Implement Firebase Cloud Storage to handle image uploads as URLs rather than Base64 strings in the database.
- Add real-time WebSocket / Firestore Listeners so markers appear instantly for all users.
- Implement user authentication (Firebase Auth) to verify reporters and track contributions.
