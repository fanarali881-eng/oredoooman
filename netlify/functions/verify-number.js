const https = require('https');

function makeRequest(options, postData) {
  return new Promise((resolve, reject) => {
    const req = https.request(options, (res) => {
      let data = '';
      const cookies = res.headers['set-cookie'] || [];
      res.on('data', (chunk) => { data += chunk; });
      res.on('end', () => { resolve({ statusCode: res.statusCode, body: data, cookies }); });
    });
    req.on('error', reject);
    req.setTimeout(15000, () => { req.destroy(); reject(new Error('Request timeout')); });
    if (postData) req.write(postData);
    req.end();
  });
}

function extractCookieString(cookieHeaders) {
  return cookieHeaders.map(c => c.split(';')[0]).join('; ');
}

exports.handler = async function(event, context) {
  const headers = {
    'Access-Control-Allow-Origin': '*',
    'Access-Control-Allow-Headers': 'Content-Type',
    'Access-Control-Allow-Methods': 'POST, OPTIONS',
    'Content-Type': 'application/json'
  };

  if (event.httpMethod === 'OPTIONS') {
    return { statusCode: 200, headers, body: '' };
  }

  if (event.httpMethod !== 'POST') {
    return { statusCode: 405, headers, body: JSON.stringify({ error: 'Method not allowed' }) };
  }

  try {
    const { customer_number, type } = JSON.parse(event.body);

    if (!customer_number || !type) {
      return {
        statusCode: 400,
        headers,
        body: JSON.stringify({ error: 'Missing customer_number or type' })
      };
    }

    // Step 1: Get the page to obtain session cookies
    const pageOptions = {
      hostname: 'shop.ooredoo.om',
      port: 443,
      path: '/recharge-bill-payments?lang=ar',
      method: 'GET',
      headers: {
        'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36',
        'Accept': 'text/html,application/xhtml+xml,application/xml;q=0.9,*/*;q=0.8',
        'Accept-Language': 'ar,en;q=0.9'
      }
    };

    const pageResponse = await makeRequest(pageOptions);
    const allCookies = [...pageResponse.cookies];
    let cookieString = extractCookieString(allCookies);

    // Step 2: Get fresh nonce via wpb_return_current_nonce action
    const noncePostData = 'action=wpb_return_current_nonce';
    const nonceOptions = {
      hostname: 'shop.ooredoo.om',
      port: 443,
      path: '/wp-admin/admin-ajax.php',
      method: 'POST',
      headers: {
        'Content-Type': 'application/x-www-form-urlencoded',
        'Content-Length': Buffer.byteLength(noncePostData),
        'X-Requested-With': 'XMLHttpRequest',
        'Referer': 'https://shop.ooredoo.om/recharge-bill-payments?lang=ar',
        'Origin': 'https://shop.ooredoo.om',
        'Cookie': cookieString,
        'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36'
      }
    };

    const nonceResponse = await makeRequest(nonceOptions, noncePostData);
    
    // Update cookies if new ones received
    if (nonceResponse.cookies.length > 0) {
      cookieString = extractCookieString([...allCookies, ...nonceResponse.cookies]);
    }

    let nonce = '';
    if (nonceResponse.body) {
      try {
        nonce = JSON.parse(nonceResponse.body);
      } catch(e) {
        nonce = nonceResponse.body.replace(/['"]/g, '').trim();
      }
    }

    // Fallback: extract nonce from page HTML
    if (!nonce) {
      const nonceMatch = pageResponse.body.match(/aj_nnc["']\s*:\s*["']([^"']+)["']/);
      if (nonceMatch) nonce = nonceMatch[1];
    }

    if (!nonce) {
      return {
        statusCode: 500,
        headers,
        body: JSON.stringify({ error: 'Could not obtain nonce' })
      };
    }

    // Step 3: Call verify-customer-number API
    const postData = new URLSearchParams({
      action: 'wp_recharge_bill_payment_module',
      sub_action: 'verify-customer-number',
      customer_number: customer_number,
      type: type,
      _ajax_nonce: nonce,
      captcha_token: ''
    }).toString();

    const apiOptions = {
      hostname: 'shop.ooredoo.om',
      port: 443,
      path: '/wp-admin/admin-ajax.php',
      method: 'POST',
      headers: {
        'Content-Type': 'application/x-www-form-urlencoded',
        'Content-Length': Buffer.byteLength(postData),
        'X-Requested-With': 'XMLHttpRequest',
        'Referer': 'https://shop.ooredoo.om/recharge-bill-payments?lang=ar',
        'Origin': 'https://shop.ooredoo.om',
        'Cookie': cookieString,
        'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36'
      }
    };

    const apiResponse = await makeRequest(apiOptions, postData);

    if (apiResponse.statusCode === 200 && apiResponse.body) {
      try {
        const data = JSON.parse(apiResponse.body);
        return { statusCode: 200, headers, body: JSON.stringify(data) };
      } catch (e) {
        return { statusCode: 200, headers, body: apiResponse.body };
      }
    }

    // If failed, return error info
    return {
      statusCode: apiResponse.statusCode || 500,
      headers,
      body: JSON.stringify({ 
        error: 'API request failed',
        status: apiResponse.statusCode,
        nonce_used: nonce,
        response: apiResponse.body.substring(0, 500)
      })
    };

  } catch (error) {
    return {
      statusCode: 500,
      headers,
      body: JSON.stringify({ error: error.message })
    };
  }
};
