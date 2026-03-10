const axios = require('axios');

const API_BASE = 'http://localhost:5000/api/auth';

async function testAuth() {
  try {
    console.log('🧪 Testing Authentication Endpoints...\n');

    // Test 1: Login with superadmin
    console.log('1️⃣ Testing Login...');
    const loginResponse = await axios.post(`${API_BASE}/login`, {
      email: 'admin@evergreen.com',
      password: 'Admin123!@#'
    });
    
    console.log('✅ Login successful!');
    console.log('User:', loginResponse.data.data.user);
    console.log('Access Token:', loginResponse.data.data.accessToken.substring(0, 50) + '...');
    console.log('Refresh Token:', loginResponse.data.data.refreshToken.substring(0, 50) + '...\n');

    const { accessToken, refreshToken } = loginResponse.data.data;

    // Test 2: Get profile
    console.log('2️⃣ Testing Get Profile...');
    const profileResponse = await axios.get(`${API_BASE}/profile`, {
      headers: {
        'Authorization': `Bearer ${accessToken}`
      }
    });
    
    console.log('✅ Profile retrieved!');
    console.log('Profile:', profileResponse.data.data, '\n');

    // Test 3: Refresh token
    console.log('3️⃣ Testing Refresh Token...');
    const refreshResponse = await axios.post(`${API_BASE}/refresh-token`, {
      refreshToken
    });
    
    console.log('✅ Token refreshed!');
    console.log('New Access Token:', refreshResponse.data.data.accessToken.substring(0, 50) + '...\n');

    const newAccessToken = refreshResponse.data.data.accessToken;

    // Test 4: Test protected route with new token
    console.log('4️⃣ Testing Protected Route with New Token...');
    const newProfileResponse = await axios.get(`${API_BASE}/profile`, {
      headers: {
        'Authorization': `Bearer ${newAccessToken}`
      }
    });
    
    console.log('✅ Protected route works with new token!');
    console.log('Profile:', newProfileResponse.data.data, '\n');

    // Test 5: Logout
    console.log('5️⃣ Testing Logout...');
    await axios.post(`${API_BASE}/logout`, {
      refreshToken
    });
    
    console.log('✅ Logout successful!\n');

    console.log('🎉 All authentication tests passed!');

  } catch (error) {
    console.error('❌ Test failed:', error.response?.data || error.message);
    if (error.response) {
      console.error('Status:', error.response.status);
      console.error('Data:', error.response.data);
    }
  }
}

// Run tests
testAuth();
