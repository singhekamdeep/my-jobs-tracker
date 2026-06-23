async function test() {
  try {
    const email = `test-${Date.now()}@test.com`;
    const password = 'password123';
    
    console.log('Signing up:', email);
    let res = await fetch('http://localhost:3000/api/auth/signup', {
      method: 'POST', headers: {'Content-Type': 'application/json'},
      body: JSON.stringify({ email, password })
    });
    console.log('Signup success:', res.status, await res.json());

    console.log('Logging in:');
    res = await fetch('http://localhost:3000/api/auth/login', {
      method: 'POST', headers: {'Content-Type': 'application/json'},
      body: JSON.stringify({ email, password })
    });
    console.log('Login success:', res.status, await res.json());
  } catch (err) {
    console.error('Error:', err);
  }
}
test();
