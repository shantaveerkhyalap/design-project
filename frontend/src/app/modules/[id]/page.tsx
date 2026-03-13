import { cropModules } from '@/data/modules';
import { Button } from '@/components/ui/Button';
import { Card } from '@/components/ui/Card';
import EnrollButton from '@/components/modules/EnrollButton';
import { notFound } from 'next/navigation';
import { Clock, BarChart, BookOpen, CheckCircle, Sprout, CloudRain, Calendar } from 'lucide-react';
import styles from './page.module.css';
import { use } from 'react';
import { getModuleSyllabus } from '@/data/module_content';

export default function ModuleDetail({ params }: { params: Promise<{ id: string }> }) {
    const { id } = use(params);
    const moduleData = cropModules.find(m => m.id === id);
    const syllabus = getModuleSyllabus(id);

    if (!moduleData) return notFound();

    return (
        <div className={styles.container}>
            {/* Hero Header with Background Image */}
            <header className={styles.header} style={{ backgroundImage: `url(${(moduleData as any).image})` }}>
                <div className={styles.headerContent}>
                    <span className={styles.badge}>{(moduleData as any).category}</span>
                    <h1 className={styles.title}>{moduleData.title}</h1>
                    <p className={styles.sciName}><em>{(moduleData as any).scientificName}</em></p>
                    <p className={styles.description}>{moduleData.description}</p>

                    <div className={styles.meta}>
                        <div className={styles.metaItem}><Clock size={18} /> {moduleData.duration}</div>
                        <div className={styles.metaItem}><BarChart size={18} /> {moduleData.difficulty}</div>
                    </div>
                </div>
            </header>

            {/* Quick Stats Row */}
            <div className={styles.statsRow}>
                <div className={styles.statItem}>
                    <Sprout size={24} className={styles.statIcon} />
                    <span>Soil: {(moduleData as any).soilType || 'Standard'}</span>
                </div>
                <div className={styles.statItem}>
                    <CloudRain size={24} className={styles.statIcon} />
                    <span>Water: {(moduleData as any).waterRequirements || 'Moderate'}</span>
                </div>
                <div className={styles.statItem}>
                    <Calendar size={24} className={styles.statIcon} />
                    <span>Harvest: {(moduleData as any).harvestTime || 'Seasonal'}</span>
                </div>
            </div>

            <div className={styles.content}>
                <div className={styles.mainColumn}>
                    <Card className={styles.section}>
                        <h2>Course Overview</h2>
                        <p>
                            In this comprehensive guide to {moduleData.title}, you will learn the fundamentals of
                            sustainable cultivation. From soil preparation to harvesting, every step is covered
                            to ensure a successful yield.
                        </p>
                    </Card>

                    <Card className={styles.section}>
                        <h2>Syllabus</h2>
                        <ul className={styles.syllabus}>
                            {syllabus.map((stage) => (
                                <li key={stage.stage}>
                                    <CheckCircle size={16} className={styles.check} />
                                    <span>Stage {stage.stage}: {stage.title}</span>
                                    <span className={styles.duration}>({stage.duration})</span>
                                </li>
                            ))}
                        </ul>
                    </Card>
                </div>

                <div className={styles.sidebar}>
                    <Card className={styles.enrollCard}>
                        <h3>Ready to start?</h3>
                        <p>Track your progress and get certified.</p>
                        <EnrollButton moduleId={id} />
                        <div className={styles.enrollMeta}>
                            <BookOpen size={16} /> 4 Modules • 12 Lessons
                        </div>
                    </Card>
                </div>
            </div>
        </div>
    );
}
