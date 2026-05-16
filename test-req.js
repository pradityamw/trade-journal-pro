const http = require('http');

const data = JSON.stringify({
  name: "Test User",
  email: "test@example.com",
  password: "password123",
  confirmPassword: "password123"
});

const options = {
  hostname: 'localhost',
  port: 3000,
  path: '/api/user',
  method: 'POST',
  headers: {
    'Content-Type': 'application/json',
    'Content-Length': data.length
  }
};

const req = http.request(options, (res) => {
  let responseBody = '';
  res.on('data', (chunk) => responseBody += chunk);
  res.on('end', () => {
    console.log(`Status: ${res.statusCode}`);
    console.log(`Body: ${responseBody}`);
  });
});

req.on('error', (error) => {
  console.error(error);
});

req.write(data);
req.end();
