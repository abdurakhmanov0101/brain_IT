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
  
  // List directories in /var/www/brain-itacademy.uz and /var/www/brain_crm
  const commands = [
    'ls -la /var/www/brain-itacademy.uz',
    'ls -la /var/www/brain_crm'
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
