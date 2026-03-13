"use client";

import React, { useState } from 'react';
import { Calculator, Loader } from 'lucide-react';
import api from '@/lib/api';
import styles from './YieldCalculator.module.css';

interface YieldResult {
    crops: string[];
    estimatedIncome: string;
    bestMethod: string;
}

const YieldCalculator = () => {
    const [area, setArea] = useState<string>('');
    const [unit, setUnit] = useState<string>('sq. meters');
    const [loading, setLoading] = useState(false);
    const [result, setResult] = useState<YieldResult | null>(null);
    const [error, setError] = useState<string | null>(null);

    const calculateYield = async () => {
        if (!area || isNaN(Number(area))) {
            setError("Please enter a valid area size.");
            return;
        }

        setLoading(true);
        setError(null);
        setResult(null);

        try {
            // Get location if available, otherwise default to "Bangalore"
            let location = "Bangalore, India"; // Default

            try {
                const position = await new Promise<GeolocationPosition>((resolve, reject) => {
                    navigator.geolocation.getCurrentPosition(resolve, reject, { timeout: 5000 });
                });
                location = `${position.coords.latitude},${position.coords.longitude}`;
            } catch (e) {
                console.warn("Geolocation failed, using default location");
            }

            const response = await api.post('/ai/yield', {
                area: Number(area),
                unit,
                location
            });

            setResult(response.data);
        } catch (err: any) {
            console.error(err);
            setError(err.response?.data?.message || "Failed to calculate yield. Please try again.");
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className={styles.container}>
            <div className={styles.header}>
                <Calculator size={24} />
                <h3>Yield Calculator</h3>
            </div>

            <div className={styles.inputGroup}>
                <label className={styles.label}>Available Space</label>
                <div className={styles.inputRow}>
                    <input
                        type="number"
                        className={styles.input}
                        placeholder="Area size"
                        value={area}
                        onChange={(e) => setArea(e.target.value)}
                    />
                    <select
                        className={styles.select}
                        value={unit}
                        onChange={(e) => setUnit(e.target.value)}
                    >
                        <option value="sq. meters">sq. meters</option>
                        <option value="sq. feet">sq. feet</option>
                        <option value="acres">acres</option>
                    </select>
                </div>
            </div>

            <button
                className={styles.button}
                onClick={calculateYield}
                disabled={loading}
            >
                {loading ? "Calculating..." : "Calculate Potential"}
            </button>

            {loading && (
                <div className={styles.loading}>
                    <Loader className="animate-spin" size={24} />
                </div>
            )}

            {error && <div className={styles.error}>{error}</div>}

            {result && (
                <div className={styles.result}>
                    <div className={styles.resultRow}>
                        <span className={styles.resultLabel}>Recommended Crops:</span>
                        <span className={styles.resultValue}>{result.crops.join(', ')}</span>
                    </div>
                    <div className={styles.resultRow}>
                        <span className={styles.resultLabel}>Est. Income:</span>
                        <span className={styles.resultValue}>{result.estimatedIncome}</span>
                    </div>
                    <div className={styles.resultRow}>
                        <span className={styles.resultLabel}>Best Method:</span>
                        <span className={styles.resultValue}>{result.bestMethod}</span>
                    </div>
                </div>
            )}
        </div>
    );
};

export default YieldCalculator;
