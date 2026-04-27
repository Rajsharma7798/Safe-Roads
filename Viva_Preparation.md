# Safe Roads - Viva & Exam Preparation Guide

This document is specifically crafted to help you prepare for your university project viva or practical exam. It explains the core concepts, architecture, and potential questions examiners might ask about the "Safe Roads" project.

---

## 1. Project Overview & Objective
**What is Safe Roads?**
Safe Roads is a civic-tech web application that allows users to identify and report road hazards—specifically potholes and malfunctioning traffic lights. 

**Why was it built?**
To reduce road accidents and assist municipal bodies by crowdsourcing infrastructure issues. The project specifically focuses on the Loni Kalbhor and Pune region as its primary deployment area.

---

## 2. Technology Stack & Architecture (How it works)
If the examiner asks about the architecture, explain it in three layers:

### A. The Frontend (Client-Side)
- **HTML/CSS/Bootstrap 5**: Used to create a responsive, modern interface. Bootstrap provides pre-built components (like the Report Modal and Cards) which saves time.
- **Vanilla JavaScript (`app.js`)**: Handles the core logic on the browser.
- **Leaflet.js**: This is an open-source mapping library. 
  - *Why not Google Maps?* Google Maps requires a credit card and API keys which often throw billing errors ("Something went wrong"). Leaflet is free, uses OpenStreetMap data, and works flawlessly for this use case.

### B. The Backend (Server-Side)
- **Node.js & Express.js (`server.js`)**: Acts as the middleman between the user and the database. It serves the HTML files and provides REST API endpoints (`/api/reports`, `/api/all-hazards`, `/api/feedback`).
- **Base64 Image Processing**: When a user uploads an image, the browser converts it to a long text string (Base64). Express is configured to accept payloads up to `10mb` to accommodate these images.

### C. The Database
- **Firebase Firestore / Mock Database (`firebase.js`)**: 
  - We engineered a **graceful fallback mechanism**. If the `serviceAccountKey.json` is provided, the backend connects securely to Google's Firebase Firestore (a NoSQL database). 
  - If the key is missing (like during local testing), the app doesn't crash; instead, it uses an "In-Memory Mock Database" pre-populated with Pune locations.

### D. Containerization
- **Docker**: Used to package the entire application (code, runtime, node_modules) into an isolated container. This guarantees that the project will run on the examiner's computer exactly as it does on yours.

---

## 3. Step-by-Step Execution Flow
If asked to demonstrate the flow:
1. **Page Load**: `app.js` runs `initMap()` and centers Leaflet on Loni Kalbhor. It sends a `GET` request to `/api/all-hazards` to fetch existing reports.
2. **User Search**: User types a location. We automatically append ", Pune, India" in the background so the OpenStreetMap geocoder finds accurate local results.
3. **Reporting**: User clicks "Report Pothole", drops a pin, uploads a photo, and submits. `app.js` converts the photo to Base64 and sends a `POST` request to `/api/reports`.
4. **Backend Processing**: Express receives the data, adds a timestamp, and saves it to Firebase (or the Mock DB).
5. **UI Update**: The backend responds with a success message, and a new marker immediately pops up on the map.

---

## 4. Important Files to Know
- `public/index.html`: The main user interface.
- `public/css/style.css`: Custom styling, including the background map aesthetic.
- `public/js/app.js`: All frontend logic, map rendering, and API calls.
- `server/server.js`: The Express backend handling routing and endpoints.
- `server/firebase.js`: Database configuration and the Mock DB logic.
- `Dockerfile`: Instructions for building the Docker image.

---

## 5. Potential Viva Questions & Answers

**Q1: Why did you choose NoSQL (Firebase) over SQL (MySQL)?**
*Answer*: Because our data is document-centric. Hazard reports have varying fields (some have images, some don't), and NoSQL allows for a flexible schema. It's also highly scalable for crowdsourced data.

**Q2: What is Leaflet.js? Why didn't you use Google Maps API?**
*Answer*: Leaflet is an open-source JS library for interactive maps. We chose it over Google Maps to avoid API key restrictions, billing issues, and CORS errors, making the project strictly open-source and easy to run anywhere.

**Q3: How are images uploaded and stored in your project?**
*Answer*: Currently, images are converted to Base64 strings using the JavaScript `FileReader` API on the frontend, and sent as JSON to the backend. *Note: You can add that in a production environment, you would use Firebase Cloud Storage to store the actual file and save only the image URL in Firestore to save database space.*

**Q4: What happens if the Firebase connection fails?**
*Answer*: We implemented a fail-safe mock database pattern. If the Firebase credentials are missing or the connection drops, the backend utilizes a local memory array pre-seeded with dummy data so the application never crashes and can always be demonstrated.

**Q5: What does Docker do in your project?**
*Answer*: Docker containerizes the application. It packages Node.js, Express, and our code into a single image using the `Dockerfile`. This solves the "it works on my machine" problem, ensuring the environment is identical regardless of the host OS.

**Q6: Why did you increase the JSON limit in Express?**
*Answer*: In `server.js`, we set `app.use(express.json({ limit: '10mb' }))`. Standard Express configurations reject large payloads. Since we are sending images as Base64 strings within the JSON body, we needed to increase the limit to prevent `Payload Too Large (413)` errors.
