module.exports = {
  apps: [{
    name: 'hima-space',
    script: 'node_modules/.bin/next',
    args: 'start -p 4000',
    instances: 1,
    exec_mode: 'fork',
    autorestart: true,
    watch: false,
    max_memory_restart: '300M',
    env: {
      NODE_ENV: 'production',
      PORT: 4000
    },
    error_file: '/var/log/hima-space/error.log',
    out_file: '/var/log/hima-space/out.log',
    log_date_format: 'YYYY-MM-DD HH:mm:ss Z',
    merge_logs: true
  }]
};
