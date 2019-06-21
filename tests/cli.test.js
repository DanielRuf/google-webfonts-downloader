const fs = require('fs');
const childProcess = require('child_process');

const cliProcess = childProcess.spawn('node', ['bin/google-webfonts-downloader']);

setTimeout(function(){
    cliProcess.kill('SIGTERM');
}, 10000);

cliProcess.on('close', () => {
    const files = fs.readdirSync('.');
    files.some(file => /.+-fontfacekit\.zip/.test(file))
        ? process.exit(0)
        : process.exit(1);
  });