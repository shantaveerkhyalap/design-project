# ─────────────────────────────────────────────
# Stage 1: Dependencies
# ─────────────────────────────────────────────
FROM node:18-slim AS deps

WORKDIR /app

# Install system dependencies for node-canvas, Python, and TensorFlow/ML
RUN apt-get update && apt-get install -y \
    python3 \
    python3-pip \
    python3-venv \
    libgl1-mesa-glx \
    libglib2.0-0 \
    && rm -rf /var/lib/apt/lists/*

# Install Node dependencies
COPY package.json package-lock.json ./
RUN npm ci --only=production

# Install Python dependencies
COPY requirements.txt ./
# Using --no-cache-dir to keep image size slightly smaller
# Note: This will build/install TensorFlow which is very large
RUN pip3 install --no-cache-dir -r requirements.txt

# ─────────────────────────────────────────────
# Stage 2: Runner
# ─────────────────────────────────────────────
FROM node:18-slim AS runner

WORKDIR /app

# Install Python and shared libraries in the runner stage
RUN apt-get update && apt-get install -y \
    python3 \
    python3-pip \
    libgl1-mesa-glx \
    libglib2.0-0 \
    && rm -rf /var/lib/apt/lists/*

# Create a non-root user for security (debian uses adduser differently)
RUN groupadd -r appgroup && useradd -r -g appgroup appuser

# Copy Node & Python packages from deps stage
COPY --from=deps /app/node_modules ./node_modules
COPY --from=deps /usr/local/lib/python3.*/dist-packages /usr/local/lib/python3.*/dist-packages
COPY --from=deps /usr/local/bin /usr/local/bin

# Copy application source
COPY . .

# Ensure upload directory exists and has correct permissions
RUN mkdir -p uploads && chown -R appuser:appgroup /app

USER appuser

# Expose Express port
EXPOSE 5000

# Start the server
CMD ["node", "server.js"]
