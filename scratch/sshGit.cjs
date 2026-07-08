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
  
  // Commands to run in /var/www/brain_crm
  // 1. git pull (since it is a clone of AvazbekQulsoatovich/brain_crm or similar)
  // 2. npm install
  // 3. npm run build
  // 4. copy build files (dist/*) to /var/www/brain-itacademy.uz
  // 5. certbot and SSL setup
  
  const commands = [
    'cd /var/www/brain_crm && git remote -v',
    'cd /var/www/brain_crm && git status'
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
