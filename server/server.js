const express = require('express');
const cors = require('cors');
const path = require('path');
const { db, isMock } = require('./firebase');

const app = express();
const PORT = process.env.PORT || 3000;

app.use(cors());
app.use(express.json({ limit: '10mb' }));

// Serve static files from the public directory
app.use(express.static(path.join(__dirname, '../public')));

// API Routes

// 1. Report a Hazard
app.post('/api/hazards', async (req, res) => {
    try {
        const { type, lat, lng, description, photoUrl } = req.body;
        
        if (!type || !lat || !lng) {
            return res.status(400).json({ error: 'Missing required fields' });
        }

        const hazardData = {
            type,
            lat,
            lng,
            description: description || '',
            photoUrl: photoUrl || '',
            timestamp: isMock ? new Date() : require('firebase-admin').firestore.FieldValue.serverTimestamp(),
            status: 'reported'
        };

        const docRef = await db.collection('Hazard_Reports').add(hazardData);
        res.status(201).json({ success: true, id: docRef.id, message: 'Hazard reported successfully' });
    } catch (error) {
        console.error('Error adding hazard:', error);
        res.status(500).json({ error: 'Failed to report hazard' });
    }
});

// 2. Get All Hazards
app.get('/api/all-hazards', async (req, res) => {
    try {
        const snapshot = await db.collection('Hazard_Reports').get();
        if (snapshot.empty) {
            return res.status(404).json({ error: 'No hazards found' });
        }

        const docs = snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
        res.json(docs);
    } catch (error) {
        console.error('Error fetching all hazards:', error);
        res.status(500).json({ error: 'Failed to fetch hazards' });
    }
});

// 3. Get Random Hazard (for the dice button)
app.get('/api/random-hazard', async (req, res) => {
    try {
        const snapshot = await db.collection('Hazard_Reports').get();
        if (snapshot.empty) {
            return res.status(404).json({ error: 'No hazards found' });
        }

        const docs = snapshot.docs;
        const randomDoc = docs[Math.floor(Math.random() * docs.length)];
        
        res.json({ id: randomDoc.id, ...randomDoc.data() });
    } catch (error) {
        console.error('Error fetching random hazard:', error);
        res.status(500).json({ error: 'Failed to fetch hazard' });
    }
});

// 4. Submit Feedback
app.post('/api/feedback', async (req, res) => {
    try {
        const { name, email, phone, category, message } = req.body;

        if (!category || !message || !email || !phone) {
            return res.status(400).json({ error: 'Category, message, email, and phone are required' });
        }

        const feedbackData = {
            name: name || 'Anonymous',
            email,
            phone,
            category,
            message,
            timestamp: isMock ? new Date() : require('firebase-admin').firestore.FieldValue.serverTimestamp()
        };

        const docRef = await db.collection('User_Feedback').add(feedbackData);
        res.status(201).json({ success: true, id: docRef.id, message: 'Feedback submitted successfully' });
    } catch (error) {
        console.error('Error submitting feedback:', error);
        res.status(500).json({ error: 'Failed to submit feedback' });
    }
});

app.listen(PORT, () => {
    console.log(`Server is running on http://localhost:${PORT}`);
});
