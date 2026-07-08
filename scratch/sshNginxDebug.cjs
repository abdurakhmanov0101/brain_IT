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
  // 1. Check systemctl status nginx
  // 2. Check Nginx config test
  // 3. Cat the nginx config files in /etc/nginx/sites-enabled/
  const commands = [
    'echo "yzNRMUE9ww" | sudo -S systemctl status nginx',
    'echo "yzNRMUE9ww" | sudo -S nginx -t',
    'echo "yzNRMUE9ww" | sudo -S ls -la /etc/nginx/sites-enabled/',
    'echo "yzNRMUE9ww" | sudo -S cat /etc/nginx/sites-enabled/brain-itacademy.uz || true',
    'echo "yzNRMUE9ww" | sudo -S cat /etc/nginx/sites-enabled/default || true'
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
