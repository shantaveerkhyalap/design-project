"use client";

import React, { useState } from 'react';
import { Calculator, Sprout } from 'lucide-react';
import { Button } from '@/components/ui/Button';
import { Card } from '@/components/ui/Card';
import styles from './CropCalculator.module.css';

export default function CropCalculator() {
    const [area, setArea] = useState('');
    const [unit, setUnit] = useState('sqm');
    const [suggestion, setSuggestion] = useState<null | any>(null);

    const calculate = () => {
        const val = parseFloat(area);
        if (!val) return;

        // Mock logic
        let result = {
            crops: ['Lettuce', 'Spinach', 'Herbs'],
            income: '₹15,000 - ₹25,000 / month',
            method: 'Hydroponics (NFT)'
        };

        if (val > 50) {
            result = {
                crops: ['Tomatoes', 'Peppers', 'Cucumbers'],
                income: '₹40,000 - ₹65,000 / month',
                method: 'Drip Irrigation or Dutch Buckets'
            };
        }

        if (val > 200) {
            result = {
                crops: ['Mixed Vegetables', 'Mushrooms', 'Microgreens'],
                income: '₹1,20,000+ / month',
                method: 'Integrated Multi-cropping'
            };
        }

        setSuggestion(result);
    };

    return (
        <Card className={styles.container}>
            <div className={styles.header}>
                <Calculator size={24} className={styles.icon} />
                <h2>Yield Calculator</h2>
            </div>

            <div className={styles.inputGroup}>
                <label>Available Space</label>
                <div className={styles.row}>
                    <input
                        type="number"
                        placeholder="Area size"
                        value={area}
                        onChange={(e) => setArea(e.target.value)}
                        className={styles.input}
                    />
                    <select value={unit} onChange={(e) => setUnit(e.target.value)} className={styles.select}>
                        <option value="sqm">sq. meters</option>
                        <option value="sqft">sq. feet</option>
                    </select>
                </div>
            </div>

            <Button onClick={calculate} className={styles.calculateBtn} disabled={!area}>
                Calculate Potential
            </Button>

            {suggestion && (
                <div className={styles.result}>
                    <div className={styles.resultItem}>
                        <span>Recommended Crops:</span>
                        <strong>{suggestion.crops.join(', ')}</strong>
                    </div>
                    <div className={styles.resultItem}>
                        <span>Est. Income:</span>
                        <strong>{suggestion.income}</strong>
                    </div>
                    <div className={styles.resultItem}>
                        <span>Best Method:</span>
                        <strong>{suggestion.method}</strong>
                    </div>
                </div>
            )}
        </Card>
    );
}
