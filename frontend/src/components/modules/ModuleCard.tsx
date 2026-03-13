import Link from 'next/link';
import Image from 'next/image';
import { Clock, BarChart } from 'lucide-react';
import { Card } from '@/components/ui/Card';
import { Button } from '@/components/ui/Button';
import { Module } from '@/data/modules';
import styles from './ModuleCard.module.css';

interface ModuleCardProps {
    module: Module;
    completed?: boolean;
}

export default function ModuleCard({ module, completed }: ModuleCardProps) {
    // Use a fallback if image is just a placeholder name or ensure valid path
    const imageSrc = module.image.startsWith('/') ? module.image : '/images/placeholder.png'; // Basic check

    return (
        <Card className={styles.card} hoverEffect>
            <div className={styles.imageWrapper}>
                {/* In real app, we'd use Next.js Image with proper sizing */}
                {/* eslint-disable-next-line @next/next/no-img-element */}
                <img src={imageSrc} alt={module.title} className={styles.image} />
                <div className={styles.badges}>
                    <span className={`${styles.badge} ${styles[module.category]}`}>
                        {module.category.replace('-', ' ')}
                    </span>
                    {completed && (
                        <span className={`${styles.badge} ${styles.completed}`} style={{ backgroundColor: '#10b981', color: 'white', marginLeft: '0.5rem' }}>
                            Completed
                        </span>
                    )}
                </div>
            </div>

            <div className={styles.content}>
                <h3 className={styles.title}>{module.title}</h3>
                <p className={styles.description}>{module.description}</p>

                <div className={styles.meta}>
                    <div className={styles.metaItem}>
                        <Clock size={16} /> {module.duration}
                    </div>
                    <div className={styles.metaItem}>
                        <BarChart size={16} /> {module.difficulty}
                    </div>
                </div>

                <Link href={`/modules/${module.id}`} className={styles.action}>
                    <Button variant="outline" size="sm" className={styles.fullBtn}>
                        Start Module
                    </Button>
                </Link>
            </div>
        </Card>
    );
}
