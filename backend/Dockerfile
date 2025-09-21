# Backend Dockerfile simple pour Cloud Run
FROM node:20-slim
# Set working directory
WORKDIR /app

# Install dependencies for better performance and native modules
RUN apk add --no-cache \
    dumb-init \
    python3 \
    make \
    g++ \
    && rm -rf /var/cache/apk/*

# Copy package files
COPY package*.json ./

# Install dependencies with proper flags
RUN npm ci --omit=dev && npm cache clean --force

# Create non-root user for security
RUN addgroup -g 1001 -S nodejs && \
    adduser -S nodejs -u 1001

# Copy source code
COPY . .

# Change ownership to nodejs user
RUN chown -R nodejs:nodejs /app
USER nodejs

# Health check
HEALTHCHECK --interval=30s --timeout=3s --start-period=5s --retries=3 \
    CMD node healthcheck.js || exit 1

# Expose port (matches Cloud Run configuration)
EXPOSE 3001
# Start the application
CMD ["node", "src/server.js"]
