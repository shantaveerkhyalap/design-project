"use client";

import Link from "next/link";
import { ArrowRight, Leaf, CloudSun, TrendingUp, Users } from "lucide-react";
import styles from "./page.module.css";
import { Button } from "@/components/ui/Button";
import { Card } from "@/components/ui/Card";
import { useEffect, useState } from "react";

export default function Home() {
  const [isLoggedIn, setIsLoggedIn] = useState(false);

  useEffect(() => {
    if (typeof window !== 'undefined') {
      const token = localStorage.getItem('token');
      setIsLoggedIn(!!token);
    }
  }, []);

  return (
    <div className={styles.container}>
      <section className={styles.hero}>
        <div className={styles.heroContent}>
          <h1 className={styles.title}>
            The Future of <span className={styles.highlight}>Virtual Farming</span>
          </h1>
          <p className={styles.subtitle}>
            From rooftop gardens to large-scale multi-cropping.
            Master the art of sustainable agriculture with AI-driven insights and expert community support.
          </p>
          <div className={styles.ctaGroup}>
            <Link href={isLoggedIn ? "/dashboard" : "/login"}>
              <Button size="lg" className={styles.ctaButton}>
                {isLoggedIn ? "Go to Dashboard" : "Start Farming"} <ArrowRight size={20} />
              </Button>
            </Link>
            <Link href="/modules">
              <Button variant="secondary" size="lg">Explore Modules</Button>
            </Link>
          </div>
        </div>
      </section>

      <section className={styles.features}>
        <Card className={styles.featureCard} hoverEffect>
          <div className={styles.iconWrapper}><Leaf size={32} /></div>
          <h3>Urban Farming</h3>
          <p>Master Aeroponics, Hydroponics, and Mushroom farming in small city spaces.</p>
        </Card>

        <Card className={styles.featureCard} hoverEffect>
          <div className={styles.iconWrapper}><TrendingUp size={32} /></div>
          <h3>Smart Income</h3>
          <p>Multi-cropping strategies to maximize monthly and annual revenue.</p>
        </Card>

        <Card className={styles.featureCard} hoverEffect>
          <div className={styles.iconWrapper}><CloudSun size={32} /></div>
          <h3>Climate AI</h3>
          <p>Real-time weather data and market price predictions for better decisions.</p>
        </Card>

        <Card className={styles.featureCard} hoverEffect>
          <div className={styles.iconWrapper}><Users size={32} /></div>
          <h3>Expert Community</h3>
          <p>Get answers from agricultural experts and share your success stories.</p>
        </Card>
      </section>
    </div>
  );
}
