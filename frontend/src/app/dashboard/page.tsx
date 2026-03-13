import WeatherWidget from '@/components/modules/tools/WeatherWidget';
import PricePrediction from '@/components/modules/tools/PricePrediction';
import YieldCalculator from '@/components/modules/tools/YieldCalculator';
import { Card } from '@/components/ui/Card';
import { Button } from '@/components/ui/Button';
import Link from 'next/link';
import { Sprout, BookOpen, Users, Layers } from 'lucide-react';
import styles from './page.module.css';

export default function Dashboard() {
    return (
        <div className={`${styles.container} authenticated-container`}>
            <header className={styles.header}>
                <h1>Farmer&apos;s Dashboard</h1>
                <p>Welcome back! Here is your daily farming overview.</p>
            </header>

            <div className={styles.grid}>
                <div className={styles.mainColumn}>
                    <section className={styles.section}>
                        <h2 className={styles.sectionTitle}>Live Forecast</h2>
                        <div className={styles.weatherWrapper}>
                            <WeatherWidget />
                        </div>
                    </section>

                    <section className={styles.section}>
                        <h2 className={styles.sectionTitle}>Market Insights</h2>
                        <PricePrediction />
                    </section>
                </div>

                <div className={styles.sideColumn}>
                    <section className={styles.section}>
                        <YieldCalculator />
                    </section>

                    <Card className={styles.quickAction}>
                        <h3>Quick Actions</h3>
                        <div className={styles.actionGrid}>
                            <Link href="/modules">
                                <Button variant="outline" className={styles.actionBtn}>
                                    <BookOpen size={18} /> Continue Learning
                                </Button>
                            </Link>
                            <Link href="/urban-farming">
                                <Button variant="outline" className={styles.actionBtn}>
                                    <Sprout size={18} /> Urban Techniques
                                </Button>
                            </Link>
                            <Link href="/community">
                                <Button variant="outline" className={styles.actionBtn}>
                                    <Users size={18} /> Ask Expert
                                </Button>
                            </Link>
                            <Link href="/multi-cropping">
                                <Button variant="outline" className={styles.actionBtn}>
                                    <Layers size={18} /> Multi-Cropping
                                </Button>
                            </Link>
                        </div>
                    </Card>

                    <Card className={styles.alertCard}>
                        <h3>⚠️ Pest Alert</h3>
                        <p>High risk of Aphids in your region due to current humidity.</p>
                        <Link href="/community">
                            <Button size="sm" variant="secondary">View Remedies</Button>
                        </Link>
                    </Card>
                </div>
            </div>
        </div>
    );
}
