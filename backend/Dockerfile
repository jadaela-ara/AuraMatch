# Backend Dockerfile simple pour Cloud Run
FROM node:20-slim
# Set working directory
WORKDIR /app



# Copy package files
COPY package*.json ./


EXPOSE 3001
# Start the application
CMD ["node", "src/server.js"]
