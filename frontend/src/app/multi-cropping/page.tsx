"use client";

import { useState } from 'react';
import { Layers, ArrowRight, CircleDollarSign, Calendar, MapPin, Mountain, Sprout, TreePine, Leaf, X, Loader2, RotateCcw, Droplets, Clock, IndianRupee, Sun } from 'lucide-react';
import styles from './page.module.css';

interface LayerData {
    layer: string;
    crops: string;
    acresAllocated: number;
    reason: string;
}

interface CropDetail {
    name: string;
    layer: string;
    acres: number;
    duration: string;
    waterNeeds: string;
    expectedIncome: string;
    season: string;
}

interface MultiCropPlan {
    planTitle: string;
    summary: string;
    totalAcres: number;
    location: string;
    soilType: string;
    layers: LayerData[];
    cropDetails: CropDetail[];
    tips: string[];
    estimatedTotalIncome: string;
}

type PageState = 'landing' | 'input' | 'loading' | 'results';

const soilTypes = ['Red Soil', 'Black Soil', 'Alluvial Soil', 'Laterite Soil', 'Sandy Soil', 'Clay Soil', 'Loamy Soil'];

const layerIcons: Record<string, React.ReactNode> = {
    'Canopy Layer': <TreePine size={20} />,
    'Mid Layer': <Sprout size={20} />,
    'Ground Layer': <Leaf size={20} />,
    'Root Layer': <Mountain size={20} />,
};

const layerColors: Record<string, string> = {
    'Canopy Layer': '#1b5e20',
    'Mid Layer': '#2e7d32',
    'Ground Layer': '#43a047',
    'Root Layer': '#66bb6a',
};

export default function MultiCroppingPage() {
    const [pageState, setPageState] = useState<PageState>('landing');
    const [acres, setAcres] = useState('');
    const [location, setLocation] = useState('');
    const [soilType, setSoilType] = useState('Red Soil');
    const [plan, setPlan] = useState<MultiCropPlan | null>(null);
    const [error, setError] = useState('');
    const [validationError, setValidationError] = useState('');

    const handleStartPlanning = () => {
        setPageState('input');
        setError('');
        setValidationError('');
    };

    const handleAcresChange = (value: string) => {
        setAcres(value);
        const num = Number(value);
        if (value && (isNaN(num) || num <= 0)) {
            setValidationError('Invalid! Acres must be a positive number. Cropping is not possible with 0 or negative land area.');
        } else {
            setValidationError('');
        }
    };

    const handleGenerate = async () => {
        const num = Number(acres);
        if (!acres || isNaN(num) || num <= 0) {
            setValidationError('Invalid! Acres must be a positive number. Cropping is not possible with 0 or negative land area.');
            return;
        }
        if (!location.trim()) {
            setValidationError('Please enter your location for accurate recommendations.');
            return;
        }

        setValidationError('');
        setError('');
        setPageState('loading');

        try {
            const res = await fetch('http://localhost:5000/api/ai/multi-crop', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ acres: num, location: location.trim(), soilType }),
            });

            if (!res.ok) {
                const errData = await res.json();
                throw new Error(errData.message || 'Failed to generate plan');
            }

            const data: MultiCropPlan = await res.json();
            setPlan(data);
            setPageState('results');
        } catch (err: any) {
            setError(err.message || 'Something went wrong. Please try again.');
            setPageState('input');
        }
    };

    const handlePlanAgain = () => {
        setPlan(null);
        setAcres('');
        setLocation('');
        setSoilType('Red Soil');
        setPageState('input');
    };

    return (
        <div className={styles.container}>
            {/* ═══════════ LANDING SECTION (always visible) ═══════════ */}
            <header className={styles.header}>
                <div className={styles.headerContent}>
                    <h1 className={styles.title}>Multi-Cropping <span className={styles.highlight}>Mastery</span></h1>
                    <p className={styles.subtitle}>
                        Maximize your income by growing compatible crops together.
                        Transform your field into a multi-layered profit engine.
                    </p>
                    {pageState === 'landing' && (
                        <button className={styles.ctaBtn} onClick={handleStartPlanning}>
                            Start Planning <ArrowRight size={18} />
                        </button>
                    )}
                </div>
            </header>

            {/* Static info cards */}
            {pageState === 'landing' && (
                <section className={styles.infoSection}>
                    <div className={styles.infoCard}>
                        <div className={styles.infoIcon}><Layers size={28} color="#d4a017" /></div>
                        <h2>Why Multi-Crop?</h2>
                        <p>Multi-cropping involves growing two or more crops in the same space during a single growing season. It mimics natural ecosystems and provides insurance against single-crop failure.</p>
                        <div className={styles.benefits}>
                            <div className={styles.benefit}><CircleDollarSign size={20} /> Double Income</div>
                            <div className={styles.benefit}><Calendar size={20} /> Year-round Harvest</div>
                        </div>
                    </div>

                    <div className={styles.layerPreview}>
                        <h3>Multi-Layer Model</h3>
                        {['Canopy Layer', 'Mid Layer', 'Ground Layer', 'Root Layer'].map((layer) => (
                            <div key={layer} className={styles.previewRow}>
                                <span className={styles.previewIcon} style={{ color: layerColors[layer] }}>{layerIcons[layer]}</span>
                                <span className={styles.previewLabel}>{layer}</span>
                            </div>
                        ))}
                    </div>

                    <div className={styles.combosSection}>
                        <h3>Proven Combinations</h3>
                        <div className={styles.comboGrid}>
                            <div className={styles.comboCard}>
                                <h4>The &quot;Three Sisters&quot;</h4>
                                <p>Maize + Climbing Beans + Squash</p>
                                <span className={styles.yieldTag}>High Yield</span>
                            </div>
                            <div className={styles.comboCard}>
                                <h4>Spice Garden</h4>
                                <p>Coconut + Black Pepper + Turmeric</p>
                                <span className={styles.yieldTag}>High Value</span>
                            </div>
                            <div className={styles.comboCard}>
                                <h4>Nitrogen Fixer</h4>
                                <p>Wheat + Chickpea (Intercropping)</p>
                                <span className={styles.yieldTag}>Soil Health</span>
                            </div>
                        </div>
                    </div>
                </section>
            )}

            {/* ═══════════ INPUT MODAL ═══════════ */}
            {pageState === 'input' && (
                <div className={styles.modalOverlay} onClick={() => setPageState('landing')}>
                    <div className={styles.modal} onClick={(e) => e.stopPropagation()}>
                        <button className={styles.modalClose} onClick={() => setPageState('landing')}>
                            <X size={20} />
                        </button>
                        <div className={styles.modalHeader}>
                            <Sprout size={32} className={styles.modalIcon} />
                            <h2>Plan Your Multi-Crop Farm</h2>
                            <p>Our AI will research the best crop combinations for your land.</p>
                        </div>

                        <div className={styles.formGroup}>
                            <label className={styles.label}>
                                <MapPin size={16} /> Total Land (Acres)
                            </label>
                            <input
                                type="number"
                                className={`${styles.input} ${validationError && (!acres || Number(acres) <= 0) ? styles.inputError : ''}`}
                                placeholder="e.g. 50"
                                value={acres}
                                onChange={(e) => handleAcresChange(e.target.value)}
                                min="0.1"
                                step="0.1"
                            />
                        </div>

                        <div className={styles.formGroup}>
                            <label className={styles.label}>
                                <MapPin size={16} /> Location
                            </label>
                            <input
                                type="text"
                                className={styles.input}
                                placeholder="e.g. Bangalore, Karnataka"
                                value={location}
                                onChange={(e) => setLocation(e.target.value)}
                            />
                        </div>

                        <div className={styles.formGroup}>
                            <label className={styles.label}>
                                <Mountain size={16} /> Soil Type
                            </label>
                            <select
                                className={styles.select}
                                value={soilType}
                                onChange={(e) => setSoilType(e.target.value)}
                            >
                                {soilTypes.map((s) => (
                                    <option key={s} value={s}>{s}</option>
                                ))}
                            </select>
                        </div>

                        {validationError && (
                            <div className={styles.validationError}>{validationError}</div>
                        )}
                        {error && (
                            <div className={styles.errorMsg}>{error}</div>
                        )}

                        <button className={styles.generateBtn} onClick={handleGenerate}>
                            <Sprout size={18} /> Generate AI Plan
                        </button>
                    </div>
                </div>
            )}

            {/* ═══════════ LOADING STATE ═══════════ */}
            {pageState === 'loading' && (
                <div className={styles.loadingContainer}>
                    <div className={styles.loadingCard}>
                        <Loader2 size={48} className={styles.spinnerIcon} />
                        <h2>AI is researching...</h2>
                        <p>Analyzing climate, soil conditions, and crop compatibility for <strong>{location}</strong></p>
                        <div className={styles.loadingSteps}>
                            <span>🌍 Checking regional data</span>
                            <span>🌱 Evaluating crop layers</span>
                            <span>💰 Computing income potential</span>
                        </div>
                    </div>
                </div>
            )}

            {/* ═══════════ RESULTS ═══════════ */}
            {pageState === 'results' && plan && (
                <section className={styles.resultsSection}>
                    {/* Summary Card */}
                    <div className={styles.summaryCard}>
                        <div className={styles.summaryHeader}>
                            <h2>{plan.planTitle}</h2>
                            <button className={styles.planAgainBtn} onClick={handlePlanAgain}>
                                <RotateCcw size={16} /> Plan Again
                            </button>
                        </div>
                        <p className={styles.summaryText}>{plan.summary}</p>
                        <div className={styles.summaryMeta}>
                            <div className={styles.metaChip}><MapPin size={14} /> {plan.location}</div>
                            <div className={styles.metaChip}><Mountain size={14} /> {plan.soilType}</div>
                            <div className={styles.metaChip}><Layers size={14} /> {plan.totalAcres} Acres</div>
                            <div className={styles.metaChip + ' ' + styles.incomeChip}><IndianRupee size={14} /> {plan.estimatedTotalIncome}</div>
                        </div>
                    </div>

                    {/* Layer Allocation */}
                    <div className={styles.layerSection}>
                        <h3 className={styles.sectionTitle}>Layer-wise Allocation</h3>
                        <div className={styles.layerGrid}>
                            {plan.layers.map((layer, i) => (
                                <div key={i} className={styles.layerCard} style={{ borderLeftColor: layerColors[layer.layer] || '#2e7d32' }}>
                                    <div className={styles.layerCardHeader}>
                                        <span className={styles.layerIcon} style={{ color: layerColors[layer.layer] || '#2e7d32' }}>
                                            {layerIcons[layer.layer] || <Leaf size={20} />}
                                        </span>
                                        <div>
                                            <h4>{layer.layer}</h4>
                                            <span className={styles.acresBadge}>{layer.acresAllocated} acres</span>
                                        </div>
                                    </div>
                                    <p className={styles.layerCrops}>{layer.crops}</p>
                                    <p className={styles.layerReason}>{layer.reason}</p>
                                </div>
                            ))}
                        </div>
                    </div>

                    {/* Crop Details */}
                    <div className={styles.cropSection}>
                        <h3 className={styles.sectionTitle}>Crop Details</h3>
                        <div className={styles.cropGrid}>
                            {plan.cropDetails.map((crop, i) => (
                                <div key={i} className={styles.cropCard}>
                                    <div className={styles.cropHeader}>
                                        <h4>{crop.name}</h4>
                                        <span className={styles.cropLayerTag}>{crop.layer}</span>
                                    </div>
                                    <div className={styles.cropMeta}>
                                        <div className={styles.cropMetaItem}>
                                            <Layers size={14} />
                                            <span><strong>{crop.acres}</strong> acres</span>
                                        </div>
                                        <div className={styles.cropMetaItem}>
                                            <Clock size={14} />
                                            <span>{crop.duration}</span>
                                        </div>
                                        <div className={styles.cropMetaItem}>
                                            <Droplets size={14} />
                                            <span>{crop.waterNeeds}</span>
                                        </div>
                                        <div className={styles.cropMetaItem}>
                                            <Sun size={14} />
                                            <span>{crop.season}</span>
                                        </div>
                                        <div className={styles.cropMetaItem + ' ' + styles.cropIncome}>
                                            <IndianRupee size={14} />
                                            <span>{crop.expectedIncome}</span>
                                        </div>
                                    </div>
                                </div>
                            ))}
                        </div>
                    </div>

                    {/* Tips */}
                    {plan.tips && plan.tips.length > 0 && (
                        <div className={styles.tipsSection}>
                            <h3 className={styles.sectionTitle}>💡 Expert Tips</h3>
                            <div className={styles.tipsList}>
                                {plan.tips.map((tip, i) => (
                                    <div key={i} className={styles.tipItem}>
                                        <span className={styles.tipNumber}>{i + 1}</span>
                                        <p>{tip}</p>
                                    </div>
                                ))}
                            </div>
                        </div>
                    )}
                </section>
            )}
        </div>
    );
}
