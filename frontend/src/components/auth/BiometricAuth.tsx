"use client";

import React, { useState } from 'react';
import { Fingerprint, CheckCircle, Smartphone } from 'lucide-react';
import styles from './BiometricAuth.module.css';
import { Button } from '@/components/ui/Button';

export default function BiometricAuth() {
    const [status, setStatus] = useState<'idle' | 'scanning' | 'success'>('idle');

    const handleScan = () => {
        setStatus('scanning');
        // Simulate scan delay
        setTimeout(() => {
            setStatus('success');
            // Redirect after success (mock)
            setTimeout(() => {
                window.location.href = '/dashboard';
            }, 1000);
        }, 2000);
    };

    return (
        <div className={styles.container}>
            <div className={styles.iconContainer}>
                {status === 'idle' && <Fingerprint size={64} className={styles.icon} />}
                {status === 'scanning' && <Fingerprint size={64} className={`${styles.icon} ${styles.scanning}`} />}
                {status === 'success' && <CheckCircle size={64} className={`${styles.icon} ${styles.success}`} />}

                {status === 'scanning' && <div className={styles.scanLine} />}
            </div>

            <h2 className={styles.title}>
                {status === 'idle' && "Biometric Login"}
                {status === 'scanning' && "Verifying Identity..."}
                {status === 'success' && "Access Granted"}
            </h2>

            <p className={styles.instruction}>
                {status === 'idle' && "Touch the sensor to verify your identity securely."}
                {status === 'scanning' && "Keep your finger on the sensor."}
                {status === 'success' && "Welcome back, Farmer."}
            </p>

            {status === 'idle' && (
                <Button onClick={handleScan} size="lg" className={styles.scanButton}>
                    Start Scan
                </Button>
            )}

            <div className={styles.altLogin}>
                <Smartphone size={16} /> Use Passkey
            </div>
        </div>
    );
}
