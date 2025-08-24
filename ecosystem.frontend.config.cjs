module.exports = {
  apps: [{
    name: 'auramatch-frontend',
    script: 'npm',
    args: 'run dev',
    cwd: '/home/user/webapp',
    instances: 1,
    exec_mode: 'fork',
    watch: false,
    max_memory_restart: '500M',
    env: {
      NODE_ENV: 'development',
      PORT: 5173
    },
    log_file: './logs/frontend-combined.log',
    out_file: './logs/frontend-out.log',
    error_file: './logs/frontend-error.log',
    log_date_format: 'YYYY-MM-DD HH:mm:ss Z',
    merge_logs: true,
    time: true
  }]
};