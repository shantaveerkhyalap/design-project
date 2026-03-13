import { TrendingUp, ArrowUpRight, ArrowDownRight } from 'lucide-react';
import { Card } from '@/components/ui/Card';
import styles from './PricePrediction.module.css';

export default function PricePrediction() {
    const predictions = [
        { crop: 'Tomatoes', price: '₹40/kg', trend: 'up', change: '+5%' },
        { crop: 'Lettuce', price: '₹60/head', trend: 'down', change: '-2%' },
        { crop: 'Mushrooms', price: '₹200/kg', trend: 'up', change: '+12%' },
        { crop: 'Bell Peppers', price: '₹80/kg', trend: 'stable', change: '0%' },
    ];

    return (
        <Card className={styles.container}>
            <div className={styles.header}>
                <TrendingUp size={24} className={styles.icon} />
                <h2>Market AI Prediction</h2>
            </div>

            <div className={styles.list}>
                {predictions.map((item, idx) => (
                    <div key={idx} className={styles.item}>
                        <div className={styles.cropInfo}>
                            <span className={styles.cropName}>{item.crop}</span>
                            <span className={styles.cropPrice}>{item.price}</span>
                        </div>

                        <div className={`${styles.trend} ${styles[item.trend]}`}>
                            {item.trend === 'up' && <ArrowUpRight size={16} />}
                            {item.trend === 'down' && <ArrowDownRight size={16} />}
                            <span>{item.change}</span>
                        </div>
                    </div>
                ))}
            </div>

            <div className={styles.footer}>
                <p>Based on historical data & climate patterns.</p>
            </div>
        </Card>
    );
}
