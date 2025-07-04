#!/usr/bin/env node

/**
 * Simple test script to demonstrate the new API endpoints
 * Run this after starting the server to test the authentication flow
 */

const fetch = require('node-fetch');
const BASE_URL = 'http://localhost:5000/api';

async function testAuthenticationFlow() {
  console.log('🧪 Testing Authentication API Flow\n');
  
  try {
    // Test 1: Login
    console.log('1️⃣ Testing POST /api/auth/login');
    const loginResponse = await fetch(`${BASE_URL}/auth/login`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        email: 'bd.user@spoors.com',
        password: 'password123'
      })
    });
    
    if (loginResponse.ok) {
      const loginData = await loginResponse.json();
      console.log('✅ Login successful');
      console.log(`   User: ${loginData.user.email} (${loginData.user.role})`);
      console.log(`   Token: ${loginData.token.substring(0, 20)}...`);
      console.log(`   Message: ${loginData.message}\n`);
      
      const token = loginData.token;
      
      // Test 2: Get Me
      console.log('2️⃣ Testing GET /api/auth/me');
      const meResponse = await fetch(`${BASE_URL}/auth/me`, {
        headers: { 'Authorization': `Bearer ${token}` }
      });
      
      if (meResponse.ok) {
        const meData = await meResponse.json();
        console.log('✅ Get me successful');
        console.log(`   User: ${meData.user.email} (${meData.user.role})`);
        console.log(`   Message: ${meData.message}\n`);
      } else {
        console.log('❌ Get me failed:', await meResponse.text());
      }
      
      // Test 3: Logout
      console.log('3️⃣ Testing POST /api/auth/logout');
      const logoutResponse = await fetch(`${BASE_URL}/auth/logout`, {
        method: 'POST',
        headers: { 'Authorization': `Bearer ${token}` }
      });
      
      if (logoutResponse.ok) {
        const logoutData = await logoutResponse.json();
        console.log('✅ Logout successful');
        console.log(`   Message: ${logoutData.message}\n`);
      } else {
        console.log('❌ Logout failed:', await logoutResponse.text());
      }
      
    } else {
      console.log('❌ Login failed:', await loginResponse.text());
    }
    
  } catch (error) {
    console.error('❌ Test failed:', error.message);
    console.log('\n💡 Make sure the server is running: npm run dev');
  }
}

// Run the test
testAuthenticationFlow();
