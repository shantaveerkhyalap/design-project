import YieldCalculator from '@/components/modules/tools/YieldCalculator';
import PricePrediction from '@/components/modules/tools/PricePrediction';
import WeatherWidget from '@/components/modules/tools/WeatherWidget';
import styles from './page.module.css';

export default function ToolsPage() {
    return (
        <div className={styles.container}>
            <header className={styles.header}>
                <h1>Smart Farming Tools</h1>
                <p>Plan your farm, predict your income.</p>
            </header>

            <div className={styles.grid}>
                <YieldCalculator />
                <WeatherWidget />
                <PricePrediction />
            </div>
        </div>
    );
}
