"use client";

import { useEffect, useState } from 'react';
import Link from 'next/link';
import { Button } from '@/components/ui/Button';
import api from '@/lib/api';
import { BookOpen, PlayCircle, CheckCircle } from 'lucide-react';
import styles from '@/app/modules/[id]/page.module.css'; // Reusing styles from detail page for consistency

interface EnrollButtonProps {
    moduleId: string;
}

export default function EnrollButton({ moduleId }: EnrollButtonProps) {
    const [status, setStatus] = useState<'enroll' | 'continue' | 'completed'>('enroll');
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const checkProgress = async () => {
            try {
                // If no token, user is arguably not logged in, so 'enroll' is default.
                // But we should probably check if we can even make the call.
                // For now, assuming standard protected route behavior or handling 401 gracefully.
                const token = localStorage.getItem('token');
                if (!token) {
                    setLoading(false);
                    return;
                }

                const { data } = await api.get('/users/progress');
                const moduleProgress = data.find((p: any) => p.moduleId === moduleId);

                if (moduleProgress) {
                    if (moduleProgress.isCompleted) {
                        setStatus('completed');
                    } else if (moduleProgress.completedStages && moduleProgress.completedStages.length > 0) {
                        setStatus('continue');
                    }
                }
            } catch (error) {
                console.error("Failed to check progress:", error);
            } finally {
                setLoading(false);
            }
        };

        checkProgress();
    }, [moduleId]);

    if (loading) {
        return <Button className={styles.fullBtn} disabled>Loading...</Button>;
    }

    if (status === 'completed') {
        return (
            <div>
                <Link href={`/modules/${moduleId}/learn`}>
                    <Button className={styles.fullBtn} variant="secondary">
                        Review Course <CheckCircle size={16} style={{ marginLeft: '8px' }} />
                    </Button>
                </Link>
                <p style={{ marginTop: '0.5rem', textAlign: 'center', fontSize: '0.9rem', color: '#16a34a' }}>
                    You have completed this course!
                </p>
            </div>
        );
    }

    if (status === 'continue') {
        return (
            <Link href={`/modules/${moduleId}/learn`}>
                <Button className={styles.fullBtn}>
                    Continue Learning <PlayCircle size={16} style={{ marginLeft: '8px' }} />
                </Button>
            </Link>
        );
    }

    return (
        <Link href={`/modules/${moduleId}/learn`}>
            <Button className={styles.fullBtn} size="lg">
                Enroll Now
            </Button>
        </Link>
    );
}
