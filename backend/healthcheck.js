#!/usr/bin/env node
/**
 * Healthcheck script for Cloud Run deployment
 * Checks if the server is responding on the expected port
 */

const http = require('http');

const PORT = process.env.PORT || 3001;
const options = {
  host: '0.0.0.0',
  port: PORT,
  timeout: 2000,
  path: '/api/health'
};

const healthCheck = http.request(options, (res) => {
  console.log(`Health check status: ${res.statusCode}`);
  if (res.statusCode === 200) {
    process.exit(0);
  } else {
    process.exit(1);
  }
});

healthCheck.on('error', (error) => {
  console.error('Health check failed:', error.message);
  process.exit(1);
});

healthCheck.on('timeout', () => {
  console.error('Health check timeout');
  process.exit(1);
});

healthCheck.end();