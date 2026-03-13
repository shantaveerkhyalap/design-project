"use client";

import { urbanModules } from '@/data/modules';
import UrbanCard from '@/components/modules/UrbanCard';
import styles from './page.module.css';

export default function UrbanFarmingPage() {
    return (
        <div className={styles.container}>
            <header className={styles.header}>
                <h1 className={styles.title}>Urban Farming</h1>
                <p className={styles.subtitle}>Maximize Yield in Minimal Space. Explore modern techniques for city farmers.</p>
            </header>

            <div className={styles.grid}>
                {urbanModules.map((module) => (
                    <UrbanCard key={module.id} module={module} />
                ))}
            </div>
        </div>
    );
}