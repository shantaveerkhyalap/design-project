"use client";

import Link from 'next/link';
import Image from 'next/image';
import { Layers, Clock } from 'lucide-react';
import styles from './UrbanCard.module.css';
import { UrbanModule } from '@/data/modules';

interface UrbanCardProps {
    module: UrbanModule;
    completed?: boolean;
}

export default function UrbanCard({ module, completed = false }: UrbanCardProps) {
    return (
        <div className={styles.card}>
            <div className={styles.imageContainer}>
                <span className={styles.badge}>URBAN TECH</span>
                <Image
                    src={module.image}
                    alt={module.title}
                    fill
                    className={styles.image}
                    sizes="(max-width: 640px) 100vw, (max-width: 960px) 50vw, 33vw"
                />
            </div>

            <div className={styles.content}>
                <h3 className={styles.title}>{module.title}</h3>
                <p className={styles.description}>{module.description}</p>

                <div className={styles.metaRow}>
                    <div className={styles.metaItem}>
                        <Layers size={16} />
                        <span>{module.steps.length} Steps</span>
                    </div>
                    <div className={styles.metaItem}>
                        <Clock size={16} />
                        <span>{module.pace}</span>
                    </div>
                </div>

                <Link href={`/modules/${module.id}/learn`} className={styles.buttonLink}>
                    <button className={`${styles.button} ${completed ? styles.completed : ''}`}>
                        {completed ? 'Review Technique' : 'Explore Technique'}
                    </button>
                </Link>
            </div>
        </div>
    );
}
