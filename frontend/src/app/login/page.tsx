"use client";

import { useState } from 'react';
import { useAuth } from '@/context/AuthContext';
import { Button } from '@/components/ui/Button';
import { Card } from '@/components/ui/Card';
import Link from 'next/link';
import { Fingerprint, Mail, Lock, ArrowRight } from 'lucide-react';
import styles from './page.module.css';

export default function LoginPage() {
    const { login, loginWithPasskey } = useAuth();
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [error, setError] = useState('');

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setError('');
        try {
            await login(email, password);
        } catch (err: any) {
            setError(err.message);
        }
    };

    const handlePasskeyLogin = async () => {
        if (!email) {
            setError('Please enter your email to identify account');
            return;
        }
        setError('');
        try {
            await loginWithPasskey(email);
        } catch (err: any) {
            setError(err.message);
        }
    };

    return (
        <div className={styles.container}>
            <Card className={styles.authCard}>
                <div className={styles.header}>
                    <h1>Welcome Back</h1>
                    <p>Login to continue your learning journey</p>
                </div>

                {error && <div className={styles.error}>{error}</div>}

                <form onSubmit={handleSubmit} className={styles.form}>
                    <div className={styles.inputGroup}>
                        <Mail className={styles.icon} size={20} />
                        <input
                            type="email"
                            placeholder="Email Address"
                            value={email}
                            onChange={(e) => setEmail(e.target.value)}
                            required
                        />
                    </div>
                    <div className={styles.inputGroup}>
                        <Lock className={styles.icon} size={20} />
                        <input
                            type="password"
                            placeholder="Password"
                            value={password}
                            onChange={(e) => setPassword(e.target.value)}
                            required
                        />
                    </div>

                    <Button type="submit" className={styles.submitBtn}>
                        Login <ArrowRight size={18} />
                    </Button>
                </form>

                <div className={styles.divider}>
                    <span>OR</span>
                </div>

                <Button
                    variant="outline"
                    className={styles.passkeyBtn}
                    onClick={handlePasskeyLogin}
                >
                    <Fingerprint size={20} /> Login with Passkey / FaceID
                </Button>

                <p className={styles.footer}>
                    Don't have an account? <Link href="/signup">Sign Up</Link>
                </p>
            </Card>
        </div>
    );
}
