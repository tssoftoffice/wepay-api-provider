const axios = require('axios');
const { SocksProxyAgent } = require('socks-proxy-agent');
require('dotenv').config();

const WEPAY_ENDPOINT = process.env.WEPAY_ENDPOINT || 'https://www.wepay.in.th/client_api.json.php';
const USERNAME = process.env.WEPAY_USERNAME;
const PASSWORD = process.env.WEPAY_PASSWORD;
const PROXY_URL = process.env.WEPAY_PROXY_URL; // Should look like socks5://127.0.0.1:9000

async function checkBalance() {
    console.log('--- Config ---');
    console.log('Endpoint:', WEPAY_ENDPOINT);
    console.log('Username:', USERNAME ? 'Set' : 'Not Set');
    console.log('Proxy:', PROXY_URL || 'Not Set');

    if (!USERNAME || !PASSWORD) {
        throw new Error('Credentials missing');
    }

    const formData = new FormData();
    formData.append('username', USERNAME);
    formData.append('password', PASSWORD);
    formData.append('type', 'balance_inquiry');

    const config = {
        headers: { 'Content-Type': 'multipart/form-data' }
    };

    if (PROXY_URL) {
        console.log(`Connecting via Proxy: ${PROXY_URL}`);
        const agent = new SocksProxyAgent(PROXY_URL);
        config.httpAgent = agent;
        config.httpsAgent = agent;
    }

    try {
        console.log('Sending Request...');
        const res = await axios.post(WEPAY_ENDPOINT, formData, config);
        console.log('Response Status:', res.status);
        console.log('Response Data:', res.data);
    } catch (error) {
        console.error('Request Failed!');
        console.error('Message:', error.message);
        if (error.response) {
            console.error('Status:', error.response.status);
            console.error('Data:', error.response.data);
        }
    }
}

checkBalance();
