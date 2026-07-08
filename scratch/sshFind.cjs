const { Client } = require('ssh2');

const conn = new Client();

const config = {
  host: '95.182.119.84',
  port: 22,
  username: 'webdevaj',
  password: 'yzNRMUE9ww'
};

conn.on('ready', () => {
  console.log('SSH connection established successfully!');
  
  // Commands to run
  // 1. Locate the brain folder (likely /var/www/brain or in user's home folder)
  // 2. Git pull (clean reset if needed to avoid local conflict on server)
  // 3. Rebuild frontend
  // 4. Install certbot and config Nginx SSL
  
  const commands = [
    'pwd',
    'ls -la',
    'find ~ -maxdepth 3 -name "*brain*" 2>/dev/null || true',
    'find /var/www -maxdepth 3 -name "*brain*" 2>/dev/null || true'
  ];

  runNextCommand(commands);
}).connect(config);

function runNextCommand(commands) {
  if (commands.length === 0) {
    conn.end();
    return;
  }
  
  const cmd = commands.shift();
  console.log(`\nExecuting: ${cmd}`);
  
  conn.exec(cmd, (err, stream) => {
    if (err) {
      console.error('Error executing command:', err);
      conn.end();
      return;
    }
    
    stream.on('close', (code, signal) => {
      runNextCommand(commands);
    }).on('data', (data) => {
      console.log(data.toString());
    }).stderr.on('data', (data) => {
      console.error('STDERR: ' + data);
    });
  });
}
