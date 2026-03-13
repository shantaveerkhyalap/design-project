"use client";

import { urbanModules } from '@/data/modules';
import { Button } from '@/components/ui/Button';
import { Card } from '@/components/ui/Card';
import { notFound, useParams } from 'next/navigation';
import { CheckCircle, BookOpen, Layers, GraduationCap } from 'lucide-react';
import { useState } from 'react';
import styles from './page.module.css';

export default function UrbanDetail() {
    const params = useParams();
    const id = params.id as string;
    const urbanModule = urbanModules.find(m => m.id === id);
    const [enrolled, setEnrolled] = useState(false);
    const [completedSteps, setCompletedSteps] = useState<Set<number>>(new Set());

    if (!urbanModule) return notFound();

    const stepCount = urbanModule.steps.length;
    const completedCount = completedSteps.size;
    const progressPercent = stepCount > 0 ? Math.round((completedCount / stepCount) * 100) : 0;

    const toggleStep = (index: number) => {
        setCompletedSteps(prev => {
            const next = new Set(prev);
            if (next.has(index)) {
                next.delete(index);
            } else {
                next.add(index);
            }
            return next;
        });
    };

    const handleUnenroll = () => {
        setEnrolled(false);
        setCompletedSteps(new Set());
    };

    return (
        <div className={styles.container}>
            {/* Hero Header */}
            <header className={styles.header} style={{ backgroundImage: `linear-gradient(rgba(0,0,0,0.65), rgba(0,0,0,0.8)), url(${urbanModule.image})` }}>
                <div className={styles.headerContent}>
                    <span className={styles.badge}>Urban Tech</span>
                    <h1 className={styles.title}>{urbanModule.title}</h1>
                    <p className={styles.description}>{urbanModule.description}</p>

                    <div className={styles.meta}>
                        <div className={styles.metaItem}><Layers size={18} /> {urbanModule.steps.length} Steps</div>
                        <div className={styles.metaItem}><BookOpen size={18} /> Self-paced</div>
                    </div>
                </div>
            </header>

            <div className={styles.content}>
                <div className={styles.mainColumn}>
                    <Card className={styles.section}>
                        <h2>About This Technique</h2>
                        <p>
                            {urbanModule.description} This self-paced module walks you through every step —
                            from setup to your first harvest. Follow along and check off each step as you complete it.
                        </p>
                    </Card>

                    <Card className={styles.section}>
                        <h2><GraduationCap size={22} style={{ marginRight: '0.5rem', verticalAlign: 'middle' }} />Steps to Follow</h2>
                        <ul className={styles.syllabus}>
                            {urbanModule.steps.map((step, idx) => {
                                const isChecked = completedSteps.has(idx);
                                return (
                                    <li key={idx} className={`${styles.syllabusItem} ${enrolled && isChecked ? styles.syllabusItemDone : ''}`}>
                                        <div className={styles.syllabusHeader}>
                                            {enrolled ? (
                                                <input
                                                    type="checkbox"
                                                    checked={isChecked}
                                                    onChange={() => toggleStep(idx)}
                                                    className={styles.stepCheckbox}
                                                />
                                            ) : (
                                                <CheckCircle size={18} className={styles.check} />
                                            )}
                                            <div>
                                                <span className={styles.stepNumber}>Step {idx + 1}</span>
                                                <span className={`${styles.stepText} ${enrolled && isChecked ? styles.stepTextDone : ''}`}>{step}</span>
                                            </div>
                                        </div>
                                    </li>
                                );
                            })}
                        </ul>
                    </Card>
                </div>

                <div className={styles.sidebar}>
                    <Card className={styles.enrollCard}>
                        {enrolled ? (
                            <>
                                <div className={styles.enrolledBadge}>✓ Enrolled</div>
                                <h3>You&apos;re in!</h3>
                                <div className={styles.progressBar}>
                                    <div className={styles.progressFill} style={{ width: `${progressPercent}%` }}></div>
                                </div>
                                <p className={styles.progressText}>{completedCount} / {stepCount} steps completed ({progressPercent}%)</p>
                                <Button className={styles.fullBtn} size="lg" variant="outline" onClick={handleUnenroll}>
                                    Unenroll
                                </Button>
                            </>
                        ) : (
                            <>
                                <h3>Ready to start?</h3>
                                <p>Track your progress step by step.</p>
                                <Button className={styles.fullBtn} size="lg" onClick={() => setEnrolled(true)}>
                                    Enroll Now
                                </Button>
                            </>
                        )}
                        <div className={styles.enrollMeta}>
                            <Layers size={16} /> {stepCount} Steps • Self-paced
                        </div>
                    </Card>
                </div>
            </div>
        </div>
    );
}