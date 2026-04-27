# Safe Roads - Pothole & Traffic Light Detection Platform

Safe Roads is a civic-tech platform designed to help road users identify, report, and avoid potholes and malfunctioning traffic lights in their vicinity, significantly reducing accidents and improving urban infrastructure. The project currently targets the Loni Kalbhor and broader Pune region in India.

## Features
*   **Interactive Map**: Powered by Leaflet.js, automatically defaults to Loni Kalbhor, Pune.
*   **Hazard Reporting**: Users can report potholes and broken traffic lights directly on the map.
*   **Photo Uploads**: Supports uploading image evidence (up to 10MB) via Base64 encoding.
*   **Smart Search**: Search functionality automatically biases to Pune, India.
*   **Feedback/Contact Form**: Capture user feedback, bugs, and contact information seamlessly.
*   **Mock/Real Database**: Currently runs a graceful fallback in-memory mock database which automatically switches to Firebase Firestore when credentials are provided.

## Technology Stack
*   **Frontend**: HTML5, CSS3, Bootstrap 5, FontAwesome, Vanilla JavaScript, Leaflet.js (OpenStreetMap)
*   **Backend**: Node.js, Express.js
*   **Database**: Firebase Firestore (NoSQL) / In-Memory Mock Database
*   **Deployment**: Docker

## Installation & Setup

### 1. Running Locally (Without Docker)
1. Ensure you have [Node.js](https://nodejs.org/) installed.
2. Clone or open the repository.
3. Install dependencies:
   ```bash
   npm install
   ```
4. Start the server:
   ```bash
   npm start
   ```
5. Open your browser and navigate to `http://localhost:3000`.

### 2. Running via Docker
1. Ensure [Docker](https://www.docker.com/) is installed and running.
2. Build the Docker image:
   ```bash
   docker build -t safe-roads-app .
   ```
3. Run the Docker container:
   ```bash
   docker run -p 3000:3000 -d --name safe-roads-container safe-roads-app
   ```
4. Access the platform at `http://localhost:3000`.

## Enabling the Real Firebase Database
By default, the server runs a simulated "Mock Database". To connect your real Firebase database:
1. Go to your Firebase Console and download your Service Account JSON key.
2. Rename the file to `serviceAccountKey.json`.
3. Place the file inside the `/server` directory.
4. Restart the server. It will automatically detect the key and switch to the live database.
