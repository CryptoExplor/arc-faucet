import https from 'https';

const CIRCLE_API_KEY = process.env.CIRCLE_API_KEY || "TEST_API_KEY:1ef93a2a482adb58df2c615510b24c61:81b8e96bb7cb449fceba22574630ea0c";

export default async function handler(req, res) {
  try {
    // CORS headers
    res.setHeader('Access-Control-Allow-Origin', '*');
    res.setHeader('Access-Control-Allow-Methods', 'GET, POST, OPTIONS');
    res.setHeader('Access-Control-Allow-Headers', 'Content-Type');

    if (req.method === 'OPTIONS') {
      return res.status(200).end();
    }

    if (req.method !== 'POST') {
      return res.status(405).json({ error: 'Method not allowed' });
    }

    const data = req.body || {};

    if (!data.address) {
      return res.status(400).json({ error: 'Wallet address required' });
    }

    if (!data.blockchain) {
      return res.status(400).json({ error: 'Blockchain network required' });
    }

    // Build payload - Circle API accepts amount objects
    const payload = {
      address: data.address,
      blockchain: data.blockchain
    };

    if (data.native) payload.native = { amount: "1" };
    if (data.usdc) payload.usdc = { amount: "10" };
    if (data.eurc) payload.eurc = { amount: "10" };

    const postData = JSON.stringify(payload);

    // Circle API request
    const options = {
      hostname: 'api.circle.com',
      port: 443,
      path: '/v1/faucet/drips',
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${CIRCLE_API_KEY}`,
        'Content-Type': 'application/json',
        'Content-Length': Buffer.byteLength(postData)
      }
    };

    const circleResponse = await new Promise((resolve, reject) => {
      const apiReq = https.request(options, (apiRes) => {
        let responseData = '';

        apiRes.on('data', (chunk) => {
          responseData += chunk;
        });

        apiRes.on('end', () => {
          try {
            const parsedData = JSON.parse(responseData);
            resolve({
              statusCode: apiRes.statusCode,
              data: parsedData
            });
          } catch (e) {
            resolve({
              statusCode: apiRes.statusCode,
              data: { raw: responseData }
            });
          }
        });
      });

      apiReq.on('error', (error) => {
        reject(error);
      });

      apiReq.write(postData);
      apiReq.end();
    });

    return res.status(circleResponse.statusCode).json(circleResponse.data);

  } catch (error) {
    console.error('Error:', error);
    return res.status(500).json({ 
      error: 'Internal server error',
      message: error.message
    });
  }
}
