"use client";

import React, { useState, useEffect } from 'react';
import { Cloud, Sun, Wind, Droplets, CloudRain, Loader, CloudSun } from 'lucide-react';
import { Card } from '@/components/ui/Card';
import styles from './WeatherWidget.module.css';
import api from '@/lib/api';

interface WeatherData {
    temp: number;
    description: string;
    icon: string;
    humidity: number;
    windSpeed: number;
    city: string;
    country: string;
}

const WeatherWidget = () => {
    const [weather, setWeather] = useState<WeatherData | null>(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);

    useEffect(() => {
        const fetchByDefault = async () => {
            try {
                // Fallback: Bengaluru, India (lat/lon)
                const { data } = await api.get(`/weather?lat=12.9716&lon=77.5946`);
                setWeather(data);
            } catch {
                setError('Unable to load weather data.');
            } finally {
                setLoading(false);
            }
        };

        if (navigator.geolocation) {
            navigator.geolocation.getCurrentPosition(
                async (position) => {
                    try {
                        const { latitude, longitude } = position.coords;
                        const { data } = await api.get(`/weather?lat=${latitude}&lon=${longitude}`);
                        setWeather(data);
                        setLoading(false);
                    } catch (err) {
                        console.error('Weather fetch failed:', err);
                        setError('Failed to fetch weather data.');
                        setLoading(false);
                    }
                },
                (err) => {
                    // GeolocationPositionError has non-enumerable props — log them explicitly
                    console.warn(`Geolocation unavailable (code ${err.code}): ${err.message}. Using default location.`);
                    fetchByDefault();
                },
                { timeout: 8000 }
            );
        } else {
            console.warn('Geolocation not supported. Using default location.');
            fetchByDefault();
        }
    }, []);

    if (loading) {
        return (
            <Card className={styles.container}>
                <div className={styles.loading}>
                    <Loader className={styles.spinner} size={24} />
                    <p>Loading weather...</p>
                </div>
            </Card>
        );
    }

    if (error) {
        return (
            <Card className={styles.container}>
                <div className={styles.error}>
                    <Cloud size={32} />
                    <p>{error}</p>
                </div>
            </Card>
        );
    }

    if (!weather) return null;

    // Get icon based on description or API icon code
    const getIcon = (code: string) => {
        if (code.startsWith('01')) return <Sun size={48} color="#FDB813" />; // Sunny
        if (code.startsWith('02')) return <CloudSun size={48} color="#FDB813" />; // Few clouds
        if (code.startsWith('03') || code.startsWith('04')) return <Cloud size={48} color="#A0AEC0" />; // Clouds
        if (code.startsWith('09') || code.startsWith('10')) return <CloudRain size={48} color="#4FD1C5" />; // Rain
        if (code.startsWith('11')) return <CloudRain size={48} color="#805AD5" />; // Thunderstorm
        return <Cloud size={48} color="#A0AEC0" />;
    };

    const getFarmingTip = (temp: number, condition: string) => {
        if (condition.includes('rain')) return "Good time to collect rainwater. Avoid spraying pesticides.";
        if (temp > 30) return "Ensure crops are well-watered early in the morning.";
        if (temp < 15) return "Protect sensitive crops from frost overnight.";
        return "Great day for field inspection and weeding.";
    };

    return (
        <Card className={styles.container}>
            <div className={styles.header}>
                <div className={styles.location}>
                    <h3>{weather.city}, {weather.country}</h3>
                    <p className={styles.date}>{new Date().toLocaleDateString('en-US', { weekday: 'long', month: 'short', day: 'numeric' })}</p>
                </div>
                <div className={styles.weatherIcon}>
                    {getIcon(weather.icon)}
                </div>
            </div>

            <div className={styles.tempSection}>
                <div className={styles.temp}>
                    {Math.round(weather.temp)}<span className={styles.unit}>°C</span>
                </div>
                <div className={styles.condition}>
                    {weather.description.charAt(0).toUpperCase() + weather.description.slice(1)}
                </div>
            </div>

            <div className={styles.stats}>
                <div className={styles.stat}>
                    <Droplets size={16} />
                    <span>{weather.humidity}% Humidity</span>
                </div>
                <div className={styles.stat}>
                    <Wind size={16} />
                    <span>{weather.windSpeed} km/h Wind</span>
                </div>
                {/* 
                    OpenWeatherMap free API doesn't allow easy "chance of rain" without Forecast API. 
                    We'll show a generic Rain stat if it's raining, or just a placeholder to keep layout 3-col 
                 */}
                <div className={styles.stat}>
                    <CloudRain size={16} />
                    <span>{weather.description.includes('rain') ? 'Raining' : 'No Rain'}</span>
                </div>
            </div>
            <div className={styles.advice}>
                <strong>Farming Tip:</strong> {getFarmingTip(weather.temp, weather.description)}
            </div>
        </Card>
    );
};

export default WeatherWidget;
