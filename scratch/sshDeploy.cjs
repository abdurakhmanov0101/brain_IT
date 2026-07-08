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
  
  // Clean Git state on server and fetch origin
  const commands = [
    'cd /var/www/brain_crm && git fetch origin && git reset --hard origin/main',
    'cd /var/www/brain_crm && npm install && npm run build',
    'echo "yzNRMUE9ww" | sudo -S cp -r /var/www/brain_crm/dist/* /var/www/brain-itacademy.uz/',
    'echo "yzNRMUE9ww" | sudo -S chown -R www-data:www-data /var/www/brain-itacademy.uz',
    'echo "yzNRMUE9ww" | sudo -S systemctl restart nginx'
  ];

  runNextCommand(commands);
}).connect(config);

function runNextCommand(commands) {
  if (commands.length === 0) {
    console.log('\nDeployment and build completed successfully!');
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
