const chromium = require('@sparticuz/chromium');
const puppeteer = require('puppeteer-core');

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

  let browser = null;

  try {
    const { customer_number, type } = JSON.parse(event.body);

    if (!customer_number || !type) {
      return {
        statusCode: 400,
        headers,
        body: JSON.stringify({ error: 'Missing customer_number or type' })
      };
    }

    // Launch headless browser
    browser = await puppeteer.launch({
      args: chromium.args,
      defaultViewport: chromium.defaultViewport,
      executablePath: await chromium.executablePath(),
      headless: chromium.headless,
    });

    const page = await browser.newPage();
    
    // Set up request interception to capture the API response
    let apiResponse = null;
    
    await page.setRequestInterception(true);
    page.on('request', (req) => {
      // Block unnecessary resources to speed up
      const resourceType = req.resourceType();
      if (['image', 'stylesheet', 'font', 'media'].includes(resourceType)) {
        req.abort();
      } else {
        req.continue();
      }
    });

    // Navigate to the recharge page
    await page.goto('https://shop.ooredoo.om/recharge-bill-payments?lang=ar', {
      waitUntil: 'networkidle2',
      timeout: 25000
    });

    // Wait for the input field to be available
    await page.waitForSelector('input.customer-number', { timeout: 10000 });

    // Select the correct type radio button
    if (type === 'account_number') {
      await page.click('#account-no');
    } else if (type === 'b2b_account') {
      await page.click('#b2b-account');
    }
    // Default is msisdn_fdn which is already checked

    // Enter the customer number
    await page.type('input.customer-number', customer_number);

    // Set up response listener for the API call
    const responsePromise = new Promise((resolve, reject) => {
      const timeout = setTimeout(() => reject(new Error('API response timeout')), 20000);
      
      page.on('response', async (response) => {
        const url = response.url();
        if (url.includes('admin-ajax.php') && response.request().method() === 'POST') {
          try {
            const postData = response.request().postData() || '';
            if (postData.includes('verify-customer-number')) {
              clearTimeout(timeout);
              const text = await response.text();
              resolve({ status: response.status(), body: text });
            }
          } catch (e) {
            // ignore
          }
        }
      });
    });

    // Click the proceed button
    await page.click('.proceed-btn');

    // Wait for the API response
    const result = await responsePromise;

    await browser.close();
    browser = null;

    if (result.status === 200 && result.body) {
      try {
        const data = JSON.parse(result.body);
        return { statusCode: 200, headers, body: JSON.stringify(data) };
      } catch (e) {
        return { statusCode: 200, headers, body: result.body };
      }
    }

    return {
      statusCode: result.status || 500,
      headers,
      body: JSON.stringify({ error: 'API returned status ' + result.status })
    };

  } catch (error) {
    if (browser) {
      try { await browser.close(); } catch(e) {}
    }
    return {
      statusCode: 500,
      headers,
      body: JSON.stringify({ error: error.message })
    };
  }
};
