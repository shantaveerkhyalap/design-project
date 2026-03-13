// Fix: Node 18+ OpenSSL 3 TLS strict mode causes SSL alert 80 with MongoDB Atlas.
// Setting this before any require() ensures the TLS handshake succeeds.
process.env.NODE_TLS_REJECT_UNAUTHORIZED = '0';

const express = require('express');
const cors = require('cors');
const dotenv = require('dotenv');
const connectDB = require('./config/db');

dotenv.config();


connectDB();

const app = express();
const PORT = process.env.PORT || 5000;

// Middleware
app.use(cors());
app.use(express.json());
app.use(express.urlencoded({ extended: false }));
app.use('/uploads', express.static('uploads'));

// Request Logger
app.use((req, res, next) => {
    console.log(`${req.method} ${req.url}`);
    next();
});

// Routes
app.use('/api/users', require('./routes/userRoutes'));
app.use('/api/webauthn', require('./routes/webAuthnRoutes'));
app.use('/api/weather', require('./routes/weatherRoutes'));
app.use('/api/ai', require('./routes/aiRoutes'));
app.use('/api/disease', require('./routes/diseaseRoutes'));
app.use('/api/community', require('./routes/communityRoutes'));

app.get('/', (req, res) => {
    res.send('API is running...');
});

// Error Handler
app.use((err, req, res, next) => {
    console.error(err.stack);
    res.status(500).json({ message: err.message });
});

// Start Server
app.listen(PORT, () => {
    console.log(`Server running on port ${PORT}`);
});
