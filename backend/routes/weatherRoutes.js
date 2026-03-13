const express = require('express');
const axios = require('axios');
const router = express.Router();

// @desc    Get live weather data
// @route   GET /api/weather
// @access  Public
router.get('/', async (req, res) => {
    try {
        const { lat, lon } = req.query;

        if (!lat || !lon) {
            return res.status(400).json({ message: 'Latitude and Longitude are required' });
        }

        const apiKey = process.env.OPENWEATHER_API_KEY;
        if (!apiKey) {
            return res.status(500).json({ message: 'Server configuration error: Missing API Key' });
        }

        const url = `https://api.openweathermap.org/data/2.5/weather?lat=${lat}&lon=${lon}&units=metric&appid=${apiKey}`;

        const response = await axios.get(url);
        const data = response.data;

        // Simplify payload for frontend
        const weatherData = {
            temp: Math.round(data.main.temp),
            description: data.weather[0].description,
            icon: data.weather[0].icon,
            humidity: data.main.humidity,
            windSpeed: Math.round(data.wind.speed * 3.6), // m/s to km/h conversion
            city: data.name,
            country: data.sys.country
        };

        res.json(weatherData);

    } catch (error) {
        console.error(error);
        if (error.response) {
            // The request was made and the server responded with a status code
            // that falls out of the range of 2xx
            return res.status(error.response.status).json({ message: error.response.data.message });
        }
        res.status(500).json({ message: 'Failed to fetch weather data' });
    }
});

module.exports = router;
