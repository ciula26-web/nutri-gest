const { spawn } = require('child_process');
const path = require('path');

console.log('Avvio in modalita sviluppo: Server API + Vite Frontend...');

const serverProc = spawn('node', ['--watch', 'server.js'], {
  cwd: path.resolve(__dirname, 'server'),
  stdio: 'inherit',
  shell: true
});

const clientProc = spawn('npm', ['run', 'dev'], {
  cwd: path.resolve(__dirname, 'client'),
  stdio: 'inherit',
  shell: true
});

const cleanup = () => {
  serverProc.kill();
  clientProc.kill();
  process.exit();
};

process.on('SIGINT', cleanup);
process.on('SIGTERM', cleanup);
