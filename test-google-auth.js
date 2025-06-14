const puppeteer = require('puppeteer');

async function testGoogleAuth() {
  const browser = await puppeteer.launch({ headless: false });
  const page = await browser.newPage();
  
  // Enable console logging
  page.on('console', msg => console.log('PAGE LOG:', msg.text()));
  
  try {
    // Navigate to login page
    await page.goto('http://localhost:5000/login');
    
    // Wait for the Google Sign-in button
    await page.waitForSelector('button:has-text("Sign in with Google")');
    
    // Click the Google Sign-in button
    await page.click('button:has-text("Sign in with Google")');
    
    // Wait for redirect to Google
    await page.waitForNavigation({ waitUntil: 'networkidle0' });
    
    console.log('Current URL after Google redirect:', page.url());
    
    // Check if we're on Google's OAuth page
    if (page.url().includes('accounts.google.com')) {
      console.log('Successfully redirected to Google OAuth');
      
      // For testing purposes, we'll simulate the callback
      // In real usage, user would complete OAuth flow
      await page.goto('http://localhost:5000/auth/google/callback?code=test_code&state=test_state');
      
      // Wait for final redirect
      await page.waitForNavigation({ waitUntil: 'networkidle0' });
      
      console.log('Final URL after callback:', page.url());
      
      // Check if user is authenticated
      const authStatus = await page.evaluate(async () => {
        const response = await fetch('/auth/status', {
          credentials: 'include'
        });
        return await response.json();
      });
      
      console.log('Authentication status:', authStatus);
    }
    
  } catch (error) {
    console.error('Test failed:', error);
  } finally {
    await browser.close();
  }
}

// Run if this file is executed directly
if (require.main === module) {
  testGoogleAuth();
}

module.exports = { testGoogleAuth };