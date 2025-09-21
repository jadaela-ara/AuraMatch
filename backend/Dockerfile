# Backend Dockerfile pour Cloud Run - Version minimale fonctionnelle
FROM node:20-slim

# Set working directory
WORKDIR /app

# Install system dependencies including curl for health checks
RUN apt-get update && apt-get install -y \
    curl \
    && rm -rf /var/lib/apt/lists/*

# Copy package files
COPY package*.json ./

# Install dependencies
RUN npm ci --omit=dev && npm cache clean --force

# Copy source code
COPY . .

# Expose port (matches Cloud Run configuration)
EXPOSE 3001

# Health check using curl
HEALTHCHECK --interval=30s --timeout=10s --start-period=15s --retries=3 \
    CMD curl -f http://localhost:3001/api/health || exit 1

# Start the minimal application
CMD ["node", "src/server-minimal.js"]