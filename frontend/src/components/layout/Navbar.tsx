"use client";

import Link from 'next/link';
import { Sprout, User, LogOut } from 'lucide-react';
import { Button } from '../ui/Button';
import styles from './Navbar.module.css';
import { useAuth } from '@/context/AuthContext';

export default function Navbar() {
    const { user, logout } = useAuth();

    return (
        <nav className={styles.navbar}>
            <div className={styles.container}>
                <Link href="/" className={styles.logo}>
                    <Sprout size={28} color="var(--color-primary-light)" />
                    <span>Agri<span className={styles.logoHighlight}>Learn</span></span>
                </Link>

                <div className={styles.links}>
                    <Link href="/modules" className={styles.link}>Learning Modules</Link>
                    <Link href="/urban-farming" className={styles.link}>Urban Farming</Link>
                    <Link href="/multi-cropping" className={styles.link}>Multi-Cropping</Link>
                    <Link href="/crop-disease" className={styles.link}>Crop Doctor</Link>
                    <Link href="/tools" className={styles.link}>Tools</Link>
                    <Link href="/community" className={styles.link}>Expert Session</Link>
                </div>

                <div className={styles.actions}>
                    {user ? (
                        <div className={styles.userMenu}>
                            <span className={styles.userName}>Hi, {user.name.split(' ')[0]}</span>
                            <Button variant="outline" size="sm" onClick={logout} className={styles.logoutBtn}>
                                <LogOut size={16} />
                            </Button>
                        </div>
                    ) : (
                        <Link href="/login">
                            <Button variant="primary" size="sm">
                                Login / Join
                            </Button>
                        </Link>
                    )}
                </div>
            </div>
        </nav>
    );
}
