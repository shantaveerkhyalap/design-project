"use client";

import { useState, use, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { getModuleContent, getModuleSyllabus } from '@/data/module_content';
import { Button } from '@/components/ui/Button';
import { Card } from '@/components/ui/Card';
import { CheckCircle, ArrowRight, ArrowLeft, Clock } from 'lucide-react';
import styles from './page.module.css';
import api from '@/lib/api';

export default function LearnPage({ params }: { params: Promise<{ id: string }> }) {
    const { id } = use(params);
    const router = useRouter();
    const [currentStage, setCurrentStage] = useState(1);
    const [loading, setLoading] = useState(true);

    // Determine which syllabus to use
    const currentSyllabus = getModuleSyllabus(id);
    const content = getModuleContent(id, currentStage);
    const totalStages = currentSyllabus.length;

    useEffect(() => {
        const loadProgress = async () => {
            try {
                const { data } = await api.get('/users/progress');
                const moduleProgress = data.find((p: any) => p.moduleId === id);

                if (moduleProgress && moduleProgress.completedStages.length > 0) {
                    const maxCompleted = Math.max(...moduleProgress.completedStages);
                    if (maxCompleted < totalStages) {
                        setCurrentStage(maxCompleted + 1);
                    } else {
                        setCurrentStage(totalStages);
                    }
                }
            } catch (error) {
                console.error("Failed to load progress:", error);
            } finally {
                setLoading(false);
            }
        };
        loadProgress();
    }, [id, totalStages]);

    if (!content) {
        return (
            <div className={styles.container}>
                <div className={styles.error}>
                    <h2>Module Content Not Found</h2>
                    <Button onClick={() => router.back()}>Go Back</Button>
                </div>
            </div>
        );
    }

    const saveProgress = async (stage: number, completed: boolean = false) => {
        try {
            await api.post('/users/progress', {
                moduleId: id,
                stage,
                isCompleted: completed
            });
        } catch (error) {
            console.error("Failed to save progress:", error);
        }
    };

    const handleNext = async () => {
        await saveProgress(currentStage);
        if (currentStage < totalStages) setCurrentStage(curr => curr + 1);
    };

    const handlePrev = () => {
        if (currentStage > 1) setCurrentStage(curr => curr - 1);
    };

    const handleFinish = async () => {
        await saveProgress(currentStage, true);
        if (typeof window !== 'undefined') {
            // Keep local storage as backup/legacy if needed, but primarily use API
            const completed = JSON.parse(localStorage.getItem('completedModules') || '[]');
            if (!completed.includes(id)) {
                localStorage.setItem('completedModules', JSON.stringify([...completed, id]));
            }
            alert("Congratulations! You have completed the module.");
        }
        router.push('/modules');
    };

    return (
        <div className={styles.container}>
            <aside className={styles.sidebar}>
                <h3>Course Progress</h3>
                <div className={styles.timeline}>
                    {currentSyllabus.map((stageItem) => (
                        <div
                            key={stageItem.stage}
                            className={`${styles.step} ${currentStage >= stageItem.stage ? styles.active : ''} ${currentStage === stageItem.stage ? styles.current : ''}`}
                            onClick={() => setCurrentStage(stageItem.stage)}
                        >
                            <div className={styles.stepIcon}>
                                {currentStage > stageItem.stage ? <CheckCircle size={16} /> : stageItem.stage}
                            </div>
                            <div className={styles.stepContent}>
                                <span className={styles.stepTitle}>Stage {stageItem.stage}</span>
                                <span className={styles.stepDesc}>{stageItem.title}</span>
                            </div>
                        </div>
                    ))}
                </div>
                <Button variant="secondary" className={styles.exitBtn} onClick={() => router.push('/modules')}>
                    Exit Module
                </Button>
            </aside>

            <main className={styles.mainContent}>
                <header className={styles.header}>
                    <div className={styles.headerTop}>
                        <h1>Stage {content.stage}: {content.title}</h1>
                        <div className={styles.durationBadge}>
                            <Clock size={16} /> {content.duration}
                        </div>
                    </div>

                    <div className={styles.progress}>
                        <span>{Math.round((currentStage / totalStages) * 100)}% Complete</span>
                        <div className={styles.progressBar}>
                            <div
                                className={styles.progressFill}
                                style={{ width: `${(currentStage / totalStages) * 100}%` }}
                            ></div>
                        </div>
                    </div>
                </header>

                <div className={styles.contentBody}>
                    {content.topics.map((topic, idx) => (
                        <Card key={idx} className={styles.topicCard}>
                            <h3>{topic.title}</h3>
                            <div className={styles.markdown}>
                                {topic.content.split('\n\n').map((paragraph, i) => {
                                    const lines = paragraph.split('\n');
                                    const firstLine = lines[0];

                                    if (firstLine.startsWith('####')) {
                                        return (
                                            <div key={i} className={styles.headingBlock}>
                                                <h4>{firstLine.replace('#### ', '')}</h4>
                                                {lines.slice(1).map((line, j) => (
                                                    <p key={j}>{line}</p>
                                                ))}
                                            </div>
                                        );
                                    }
                                    return (
                                        <div key={i} className={styles.paragraph}>
                                            {lines.map((line, j) => (
                                                <p key={j}>{line}</p>
                                            ))}
                                        </div>
                                    );
                                })}
                            </div>
                        </Card>
                    ))}
                </div>

                <footer className={styles.footer}>
                    <Button
                        variant="secondary"
                        onClick={handlePrev}
                        disabled={currentStage === 1}
                    >
                        <ArrowLeft size={16} /> Previous Stage
                    </Button>

                    {currentStage < totalStages ? (
                        <Button onClick={handleNext}>
                            Next Stage <ArrowRight size={16} />
                        </Button>
                    ) : (
                        <Button onClick={handleFinish}>
                            Finish Course <CheckCircle size={16} />
                        </Button>
                    )}
                </footer>
            </main>
        </div>
    );
}
