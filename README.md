# 🌱 Virtual Farming Education Platform

## Overview
The Virtual Farming Education Platform is an integrated digital ecosystem designed to help beginners—students, aspiring agri-entrepreneurs, and individuals transitioning into agriculture—overcome the challenges of scattered information and a lack of structured guidance in modern farming. 

It combines step-by-step, crop-wise learning modules covering cultivation stages from planning to harvest, with intelligent tools including crop disease detection using deep learning, crop recommendation features, and real-time weather and market data integration.

## Key Features
*   **Stage-Wise Learning Modules:** Step-by-step guidance covering every phase of cultivation from seed selection to harvest.
*   **Hybrid AI Disease Detection:** Fast, accurate crop disease diagnosis and remedies powered by local image processing (EfficientNetB0) and cloud AI (Google Gemini).
*   **AI Yield & Multi-Cropping Planner:** Intelligent tools to estimate land income and suggest companion planting strategies for maximum efficiency.
*   **Real-Time Weather Dashboard:** Live local climate data integration via OpenWeatherMap to support timely, day-to-day farming decisions.
*   **Secure Biometric Login:** Fast and passwordless authentication using WebAuthn (FaceID/Fingerprint) for enhanced user security.

## System Architecture
The platform is built on a robust client-server architecture:
*   **Frontend:** Next.js 15, React, Vanilla CSS Modules
*   **Backend:** Node.js, Express.js
*   **Database:** MongoDB Atlas
*   **AI/ML Models:** Local Python/TensorFlow (EfficientNetB0) & Cloud Google Gemini 2.5

*(A visual representation is available in `architecture.png`
`)*

## Getting Started
Please refer to `setup_instructions.md` for detailed steps on how to install, configure, and run this project locally.

## Project Structure
```text
.
├── frontend/             # Next.js Web App
├── backend/              # Node.js API Server & Python ML Scripts
│   ├── models/           # Deep Learning Model Files (.keras)
│   ├── prediction_service.py # Core ML Prediction Class
│   ├── requirements.txt      # Python ML Dependencies
│   └── class_names.json      # Disease Mapping Data
├── architecture.png      # System Architecture Diagram
├── demo_video_link.txt   # Link to Project Demonstration
└── setup_instructions.md # Detailed Setup & Installation Guide
```

## Contributing
Contributions are welcome! Please fork this repository and submit a pull request with your proposed changes.

## License
MIT License
