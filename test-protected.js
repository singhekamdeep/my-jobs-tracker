async function test() {
  try {
    const email = `test-${Date.now()}@test.com`;
    const password = 'password123';
    
    console.log('Signing up:', email);
    let res = await fetch('http://localhost:3000/api/auth/signup', {
      method: 'POST', headers: {'Content-Type': 'application/json'},
      body: JSON.stringify({ email, password })
    });
    const signupData = await res.json();
    console.log('Signup success:', res.status, signupData);

    const token = signupData.data.accessToken;
    console.log('Got token:', token);

    console.log('Fetching applications:');
    let appRes = await fetch('http://localhost:3000/api/applications', {
      method: 'GET', headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${token}`
      }
    });
    console.log('Applications fetch:', appRes.status, await appRes.json());
  } catch (err) {
    console.error('Error:', err);
  }
}
test();
