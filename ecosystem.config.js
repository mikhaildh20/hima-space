module.exports = {
  apps: [{
    name: 'hima-space',
    script: 'node_modules/.bin/next',
    args: 'start -p 4000',
    instances: 1,
    exec_mode: 'fork',
    autorestart: true,
    watch: false,
    max_memory_restart: '400M',
    env: {
      NODE_ENV: 'production',
      PORT: 4000
    }
  }]
};
