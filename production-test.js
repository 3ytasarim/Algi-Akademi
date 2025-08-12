// Production database test script
const fetch = require('node-fetch');

async function testProductionDB() {
    try {
        // Test admin login with hardcoded credentials
        const adminLogin = await fetch('https://algi-akademi.replit.app/api/auth/admin-login', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ tcKimlikNo: 'admin', password: '112233' })
        });
        
        console.log('Admin login response:', await adminLogin.text());
        
        // Test if we can get users list
        const usersResponse = await fetch('https://algi-akademi.replit.app/api/users');
        console.log('Users API response:', await usersResponse.text());
        
    } catch (error) {
        console.error('Production test error:', error);
    }
}

testProductionDB();