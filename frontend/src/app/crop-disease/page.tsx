'use client';

import { useState } from 'react';
import styles from './page.module.css';
import Image from 'next/image';

interface AnalysisResult {
    crop: string;
    status: 'Healthy' | 'Diseased';
    diseaseName: string;
    confidence: number;
    description: string;
    remedies: string[];
    analysisSource?: string;
}

export default function CropDiseasePage() {
    const [selectedFile, setSelectedFile] = useState<File | null>(null);
    const [previewUrl, setPreviewUrl] = useState<string | null>(null);
    const [loading, setLoading] = useState(false);
    const [result, setResult] = useState<AnalysisResult | null>(null);
    const [dragActive, setDragActive] = useState(false);

    const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        if (e.target.files && e.target.files[0]) {
            const file = e.target.files[0];
            setSelectedFile(file);
            setPreviewUrl(URL.createObjectURL(file));
            setResult(null);
        }
    };

    const handleDrag = (e: React.DragEvent) => {
        e.preventDefault();
        e.stopPropagation();
        if (e.type === "dragenter" || e.type === "dragover") {
            setDragActive(true);
        } else if (e.type === "dragleave") {
            setDragActive(false);
        }
    };

    const handleDrop = (e: React.DragEvent) => {
        e.preventDefault();
        e.stopPropagation();
        setDragActive(false);
        if (e.dataTransfer.files && e.dataTransfer.files[0]) {
            const file = e.dataTransfer.files[0];
            setSelectedFile(file);
            setPreviewUrl(URL.createObjectURL(file));
            setResult(null);
        }
    };

    const handleAnalyze = async () => {
        if (!selectedFile) return;

        setLoading(true);
        const formData = new FormData();
        formData.append('image', selectedFile);

        try {
            const response = await fetch('http://localhost:5000/api/disease/detect', {
                method: 'POST',
                body: formData,
            });

            if (!response.ok) {
                throw new Error('Analysis failed');
            }

            const data = await response.json();
            setResult(data);
        } catch (error) {
            console.error('Error analyzing image:', error);
            alert('Failed to analyze image. Please try again.');
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className={styles.container}>
            <header className={styles.header}>
                <h1 className={styles.title}>Crop Disease Detection</h1>
                <p className={styles.subtitle}>Upload a photo of your crop to identify diseases and get remedies.</p>
            </header>

            <div className={styles.content}>
                <div
                    className={`${styles.uploadCard} ${dragActive ? styles.dragActive : ''}`}
                    onDragEnter={handleDrag}
                    onDragLeave={handleDrag}
                    onDragOver={handleDrag}
                    onDrop={handleDrop}
                >
                    {!previewUrl ? (
                        <>
                            <div className={styles.uploadIcon}>📸</div>
                            <p className={styles.uploadText}>Drag & drop your image here or</p>
                            <label htmlFor="file-upload" className={styles.selectButton}>
                                Select Image
                            </label>
                            <input
                                id="file-upload"
                                type="file"
                                className={styles.fileInput}
                                accept="image/*"
                                onChange={handleFileChange}
                            />
                        </>
                    ) : (
                        <div className={styles.previewContainer}>
                            <img
                                src={previewUrl}
                                alt="Preview"
                                className={styles.previewImage}
                            />
                            <div style={{ marginTop: '1rem' }}>
                                <button
                                    className={styles.selectButton}
                                    onClick={() => {
                                        setPreviewUrl(null);
                                        setSelectedFile(null);
                                        setResult(null);
                                    }}
                                    style={{ backgroundColor: '#e74c3c' }}
                                >
                                    Remove & Upload New
                                </button>
                            </div>
                        </div>
                    )}

                    {selectedFile && !result && (
                        <button
                            className={styles.analyzeButton}
                            onClick={handleAnalyze}
                            disabled={loading}
                        >
                            {loading ? 'Analyzing...' : 'Analyze Crop Health'}
                        </button>
                    )}
                </div>

                {loading && (
                    <div className={styles.loading}>
                        <div className={styles.spinner}></div>
                        <p>Our AI is analyzing your crop...</p>
                    </div>
                )}

                {result && (
                    <div className={styles.resultCard}>
                        <div className={styles.resultHeader}>
                            <div>
                                <h2 className={result.status === 'Healthy' ? styles.healthyName : styles.diseaseName}>
                                    {result.status === 'Healthy' ? 'Healthy Crop' : result.diseaseName}
                                </h2>
                                <p style={{ color: '#7f8c8d' }}>Detected in: <strong>{result.crop}</strong></p>
                            </div>
                            <span className={styles.confidence}>
                                {Math.round(result.confidence * 100)}% Confidence
                            </span>
                            {result.analysisSource && (
                                <span style={{
                                    display: 'inline-block',
                                    marginTop: '0.5rem',
                                    padding: '0.25rem 0.75rem',
                                    backgroundColor: result.analysisSource.includes('Local') ? '#d4edda' : '#fff3cd',
                                    color: result.analysisSource.includes('Local') ? '#155724' : '#856404',
                                    borderRadius: '20px',
                                    fontSize: '0.75rem',
                                    fontWeight: 600
                                }}>
                                    🧠 {result.analysisSource}
                                </span>
                            )}
                        </div>

                        <div className={styles.resultSection}>
                            <h3 className={styles.sectionTitle}>Diagnosis</h3>
                            <p className={styles.description}>{result.description}</p>
                        </div>

                        {result.remedies && result.remedies.length > 0 && (
                            <div className={styles.resultSection}>
                                <h3 className={styles.sectionTitle}>Recommended Treatments</h3>
                                <ul className={styles.remediesList}>
                                    {result.remedies.map((remedy, index) => (
                                        <li key={index} className={styles.remedyItem}>{remedy}</li>
                                    ))}
                                </ul>
                            </div>
                        )}
                    </div>
                )}
            </div>
        </div>
    );
}
