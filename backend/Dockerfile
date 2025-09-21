# Backend Dockerfile simple pour Cloud Run
FROM node:20-slim
# Set working directory
WORKDIR /app

# Install dependencies for better performance
RUN apt-get update && apt-get install -y \
    python3 \
    make \
    g++ \
    && rm -rf /var/lib/apt/lists/*

# Copy package files
COPY package*.json ./

# Install production dependencies
RUN npm install && npm cache clean --force

# Copy source code
COPY . .
EXPOSE 3001
# Start the application
CMD ["node", "src/server.js"]
