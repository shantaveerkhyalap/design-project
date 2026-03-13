"use client";

import { useEffect, useState } from 'react';
import ModuleCard from '@/components/modules/ModuleCard';
import { Module } from '@/data/modules';
import styles from './page.module.css';

type FilterType = 'all' | 'short-term' | 'mid-term' | 'long-term';

const filters: { label: string; value: FilterType }[] = [
    { label: 'All', value: 'all' },
    { label: 'Short Term', value: 'short-term' },
    { label: 'Mid Term', value: 'mid-term' },
    { label: 'Long Term', value: 'long-term' },
];

export default function ModulesPage() {
    const [modules, setModules] = useState<Module[]>([]);
    const [loading, setLoading] = useState(true);
    const [completedModules, setCompletedModules] = useState<string[]>([]);
    const [activeFilter, setActiveFilter] = useState<FilterType>('all');

    useEffect(() => {
        async function fetchData() {
            try {
                const modulesRes = await fetch('/api/modules');
                const modulesData = await modulesRes.json();
                setModules(modulesData);

                const token = localStorage.getItem('token');
                if (token) {
                    try {
                        const progressRes = await fetch('http://localhost:5000/api/users/progress', {
                            headers: {
                                'Authorization': `Bearer ${token}`
                            }
                        });

                        if (progressRes.ok) {
                            const progressData = await progressRes.json();
                            const completedIds = progressData
                                .filter((p: any) => p.isCompleted)
                                .map((p: any) => p.moduleId);
                            setCompletedModules(completedIds);
                        }
                    } catch (err) {
                        console.error("Failed to fetch progress", err);
                    }
                }
            } catch (error) {
                console.error("Failed to load data", error);
            } finally {
                setLoading(false);
            }
        }
        fetchData();
    }, []);

    const filteredModules = activeFilter === 'all'
        ? modules
        : modules.filter(m => m.category === activeFilter);

    return (
        <div className={styles.container}>
            <header className={styles.header}>
                <h1 className={styles.title}>Learning Modules</h1>
                <p className={styles.subtitle}>Select a crop type to begin your journey.</p>

                <div className={styles.filters}>
                    {filters.map((f) => (
                        <button
                            key={f.value}
                            className={`${styles.filterBtn} ${activeFilter === f.value ? styles.filterActive : ''}`}
                            onClick={() => setActiveFilter(f.value)}
                        >
                            {f.label}
                        </button>
                    ))}
                </div>
            </header>

            {loading ? (
                <div className={styles.loading}>
                    <div className={styles.spinner}></div>
                    <p>Loading Course Data...</p>
                </div>
            ) : (
                <div className={styles.grid}>
                    {filteredModules.map((module) => (
                        <ModuleCard
                            key={module.id}
                            module={module}
                            completed={completedModules.includes(module.id)}
                        />
                    ))}
                </div>
            )}
        </div>
    );
}
