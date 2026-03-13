# ⚙️ Installation & Setup Instructions

## Prerequisites
Ensure your development environment meets the following requirements:
*   **Node.js** (v18.0.0 or higher)
*   **Python** (v3.8.0 or higher) with pip installed
# ⚙️ Installation & Setup Instructions

## Prerequisites
Ensure your development environment meets the following requirements:
*   **Node.js** (v18.0.0 or higher)
*   **Python** (v3.8.0 or higher) with pip installed
*   **MongoDB Atlas** Account (or a local MongoDB instance)
*   Google Gemini API Key
*   OpenWeatherMap API Key

## 1. Environment Setup

### Backend (.env)
Create a `.env` file in the `backend/` directory:
```env
PORT=5000
MONGO_URI=your_mongodb_connection_string
JWT_SECRET=your_jwt_secret_key
GEMINI_API_KEY=your_google_gemini_api_key
OPENWEATHER_API_KEY=your_openweather_api_key
RP_ID=localhost
RP_NAME=AgriLearn
RP_ORIGIN=http://localhost:3000
```

### Frontend (.env.local)
Create a `.env.local` file in the `frontend/` directory (if needed for public variables).

## 2. Backend Installation (Node.js & Express)
Navigate to the backend folder and install the NPM dependencies:

```bash
cd backend
npm install
```

## 3. Python Service Installation (Machine Learning)
Inside the `backend/` directory, install the required packages for the local Deep Learning model. Ensure you use an environment that supports TensorFlow.

```bash
cd backend
pip install -r requirements.txt
```

*(Note: Ensure your Python environment is active before installing).*

## 4. Frontend Installation (Next.js)
Open a new terminal session, navigate to the frontend folder, and install the modules:

```bash
cd frontend
npm install
```

## 5. Running the Complete System

**Start the Backend Server:**
In the backend terminal, run:
```bash
npm run dev
```
*(The server should start on `http://localhost:5000`)*

**Start the Frontend Client:**
In the frontend terminal, run:
```bash
npm run dev
```
*(The web application should be accessible at `http://localhost:3000`)*

## 6. Model Training (Optional)
If you wish to re-train the default EfficientNetB0 model:
1. Place your PlantVillage crop images in `backend/dataset/ClassName/image.jpg`.
2. Run `python train_model.py` from within `backend/`.
3. Ensure the newly saved `.keras` file (e.g., `best_model(1).keras`) is placed in `backend/models/`.
4. Ensure `class_names.json` in `backend/` matches the training output.
