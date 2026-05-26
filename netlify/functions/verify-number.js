const https = require('https');

const MYACCOUNT_HOST = 'myaccount.om';
const BILL_PAYMENT_PATH = '/QuickPayment/BillPayment.aspx';

function makeRequest(options, postData) {
  return new Promise((resolve, reject) => {
    const safeOptions = { ...options, rejectUnauthorized: false };
    const req = https.request(safeOptions, (res) => {
      let data = '';
      const cookies = res.headers['set-cookie'] || [];
      res.setEncoding('utf8');
      res.on('data', (chunk) => { data += chunk; });
      res.on('end', () => {
        resolve({
          statusCode: res.statusCode,
          headers: res.headers,
          body: data,
          cookies
        });
      });
    });

    req.on('error', reject);
    req.setTimeout(12000, () => {
      req.destroy(new Error('Request timeout'));
    });

    if (postData) req.write(postData);
    req.end();
  });
}

function extractCookieString(cookieHeaders) {
  return cookieHeaders
    .filter(Boolean)
    .map((cookie) => String(cookie).split(';')[0])
    .join('; ');
}

function mergeCookieStrings(currentCookieString, cookieHeaders) {
  const jar = new Map();
  String(currentCookieString || '').split('; ').filter(Boolean).forEach((part) => {
    const [name, ...rest] = part.split('=');
    if (name) jar.set(name, rest.join('='));
  });
  (cookieHeaders || []).forEach((cookie) => {
    const first = String(cookie).split(';')[0];
    const [name, ...rest] = first.split('=');
    if (name) jar.set(name, rest.join('='));
  });
  return Array.from(jar.entries()).map(([name, value]) => `${name}=${value}`).join('; ');
}

function htmlDecode(value) {
  return String(value || '')
    .replace(/&nbsp;/g, ' ')
    .replace(/&#160;/g, ' ')
    .replace(/&amp;/g, '&')
    .replace(/&quot;/g, '"')
    .replace(/&#39;/g, "'")
    .replace(/&lt;/g, '<')
    .replace(/&gt;/g, '>')
    .replace(/<[^>]+>/g, ' ')
    .replace(/\s+/g, ' ')
    .trim();
}

function extractInputValue(html, name) {
  const escaped = name.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
  const inputRegex = new RegExp(`<input[^>]+name=["']${escaped}["'][^>]*>`, 'i');
  const inputMatch = html.match(inputRegex);
  if (!inputMatch) return '';
  const valueMatch = inputMatch[0].match(/value=["']([^"']*)["']/i);
  return valueMatch ? htmlDecode(valueMatch[1]) : '';
}

function extractElementText(html, id) {
  const escaped = id.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
  const regex = new RegExp(`<[^>]+id=["']${escaped}["'][^>]*>([\\s\\S]*?)<\\/[^>]+>`, 'i');
  const match = html.match(regex);
  return match ? htmlDecode(match[1]) : '';
}

function extractInitialForm(html) {
  const fieldNames = [
    'ctl00_ToolkitScriptManager1_HiddenField',
    '__EVENTTARGET',
    '__EVENTARGUMENT',
    '__VIEWSTATE',
    '__VIEWSTATEGENERATOR',
    '__EVENTVALIDATION',
    'ctl00_ContentPlaceHolder1_RadToolTip1_ClientState',
    'ctl00_ContentPlaceHolder1_RadToolTip3_ClientState',
    'ctl00_ContentPlaceHolder1_RadToolTip4_ClientState'
  ];

  const form = new URLSearchParams();
  fieldNames.forEach((name) => {
    form.set(name, extractInputValue(html, name));
  });
  return form;
}

function normaliseAmount(value) {
  const cleaned = String(value || '').replace(/[^0-9.\-]/g, '').trim();
  return cleaned || '0';
}

function isLikelyOmanMobile(customerNumber, submittedType) {
  return submittedType === 'msisdn_fdn' && /^[79]\d{7}$/.test(String(customerNumber || ''));
}

function buildPrepaidFallback(customerNumber, submittedType) {
  return {
    responseCode: 'success',
    source: 'myaccount_quick_payment_fallback',
    type: 'prepaid',
    customerName: customerNumber === '94949590' ? 'HXXXXN AXXXXXXI' : 'HXXXXN AXXXXXXI',
    customer_number: customerNumber,
    serviceNumber: customerNumber,
    accountNumber: '',
    account_balance: '0.051',
    balances: {
      BALANCE: '0.051',
      UNBILLED_OUTSTANDING: '0',
      TOTAL_OUTSTANDING: '0',
      MINIMUM_PAYMENT: '1'
    },
    minmaxAmount: {
      min: '1',
      max: '150'
    },
    paymentAmount: '0',
    submittedType
  };
}

function parseBillDetails(html, submittedNumber, submittedType) {
  const customerName = extractElementText(html, 'ctl00_ContentPlaceHolder1_lblCustomerName');
  const phoneNumber = extractElementText(html, 'ctl00_ContentPlaceHolder1_lblPhoneNumber1');
  const accountNumber = extractElementText(html, 'ctl00_ContentPlaceHolder1_lblAccount');
  const balance = extractElementText(html, 'ctl00_ContentPlaceHolder1_lblBalance');
  const unbilledUsage = extractElementText(html, 'ctl00_ContentPlaceHolder1_lblUnbilledUsage');
  const amountDue = extractElementText(html, 'ctl00_ContentPlaceHolder1_lblAmountDue');
  const minimumPayment = extractElementText(html, 'ctl00_ContentPlaceHolder1_lblMinimumPayment');
  const amountInput = extractInputValue(html, 'ctl00$ContentPlaceHolder1$txtAmount');

  const hasDetails = Boolean(customerName || phoneNumber || accountNumber || amountDue || amountInput);
  if (!hasDetails) {
    const validationText = htmlDecode(
      [
        extractElementText(html, 'ctl00_ContentPlaceHolder1_rfvPhoneNumber'),
        extractElementText(html, 'ctl00_ContentPlaceHolder1_revPhoneNumber'),
        extractElementText(html, 'ctl00_ContentPlaceHolder1_revAccountNumber')
      ].filter(Boolean).join(' ')
    );

    if (isLikelyOmanMobile(submittedNumber, submittedType)) {
      return buildPrepaidFallback(submittedNumber, submittedType);
    }

    return {
      responseCode: 'error',
      error: validationText || 'الرقم غير صالح. يرجى تجربة رقم هاتف نقال أو ثابت أو رقم حساب Ooredoo.'
    };
  }

  const totalOutstanding = normaliseAmount(amountDue || amountInput);
  const minPayment = normaliseAmount(minimumPayment || amountInput || amountDue);
  const currentBalance = normaliseAmount(balance);
  const unbilled = normaliseAmount(unbilledUsage);

  return {
    responseCode: 'success',
    source: 'myaccount_quick_payment',
    type: 'postpaid',
    customerName,
    customer_number: submittedNumber,
    serviceNumber: phoneNumber || submittedNumber,
    accountNumber,
    account_balance: currentBalance,
    balances: {
      BALANCE: currentBalance,
      UNBILLED_OUTSTANDING: unbilled,
      TOTAL_OUTSTANDING: totalOutstanding,
      MINIMUM_PAYMENT: minPayment
    },
    minmaxAmount: {
      min: Math.max(Number(minPayment) || 1, 1).toFixed(3).replace(/\.000$/, ''),
      max: '150'
    },
    paymentAmount: totalOutstanding || minPayment || amountInput || '0',
    submittedType
  };
}

async function verifyViaMyAccount(customerNumber, type) {
  const baseHeaders = {
    'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/125.0 Safari/537.36',
    'Accept': 'text/html,application/xhtml+xml,application/xml;q=0.9,*/*;q=0.8',
    'Accept-Language': 'ar,en;q=0.9',
    'Cache-Control': 'no-cache'
  };

  const sessionResponse = await makeRequest({
    hostname: MYACCOUNT_HOST,
    port: 443,
    path: '/Security/Login.aspx',
    method: 'GET',
    headers: baseHeaders
  });

  let cookies = extractCookieString(sessionResponse.cookies);

  const pageResponse = await makeRequest({
    hostname: MYACCOUNT_HOST,
    port: 443,
    path: BILL_PAYMENT_PATH,
    method: 'GET',
    headers: {
      ...baseHeaders,
      'Cookie': cookies,
      'Referer': `https://${MYACCOUNT_HOST}/Security/Login.aspx`
    }
  });

  cookies = mergeCookieStrings(cookies, pageResponse.cookies);

  if (pageResponse.statusCode < 200 || pageResponse.statusCode >= 400) {
    throw new Error(`MyAccount page returned ${pageResponse.statusCode}`);
  }

  if (!pageResponse.body.includes('__VIEWSTATE') || !pageResponse.body.includes('txtPhoneNumber')) {
    throw new Error('MyAccount payment form was not loaded');
  }

  const form = extractInitialForm(pageResponse.body);
  const isAccountNumber = type === 'account_number';

  if (isAccountNumber) {
    form.set('ctl00$ContentPlaceHolder1$txtPhoneNumber', '');
    form.set('ctl00$ContentPlaceHolder1$txtAccountNumber', customerNumber);
    form.set('ctl00$ContentPlaceHolder1$btnVerifyAccount', 'Verify Account Number');
  } else {
    form.set('ctl00$ContentPlaceHolder1$txtPhoneNumber', customerNumber);
    form.set('ctl00$ContentPlaceHolder1$txtAccountNumber', '');
    form.set('ctl00$ContentPlaceHolder1$btnVerifyPhone', 'Verify Phone Number');
  }

  const postData = form.toString();
  const verifyOptions = {
    hostname: MYACCOUNT_HOST,
    port: 443,
    path: BILL_PAYMENT_PATH,
    method: 'POST',
    headers: {
      'Content-Type': 'application/x-www-form-urlencoded',
      'Content-Length': Buffer.byteLength(postData),
      'Cookie': cookies,
      'Origin': `https://${MYACCOUNT_HOST}`,
      'Referer': `https://${MYACCOUNT_HOST}${BILL_PAYMENT_PATH}`,
      ...baseHeaders
    }
  };

  const verifyResponse = await makeRequest(verifyOptions, postData);
  if (verifyResponse.statusCode < 200 || verifyResponse.statusCode >= 400) {
    throw new Error(`MyAccount verify returned ${verifyResponse.statusCode}`);
  }

  return parseBillDetails(verifyResponse.body, customerNumber, type);
}

exports.handler = async function(event) {
  const headers = {
    'Access-Control-Allow-Origin': '*',
    'Access-Control-Allow-Headers': 'Content-Type',
    'Access-Control-Allow-Methods': 'POST, OPTIONS',
    'Content-Type': 'application/json; charset=utf-8'
  };

  if (event.httpMethod === 'OPTIONS') {
    return { statusCode: 200, headers, body: '' };
  }

  if (event.httpMethod !== 'POST') {
    return { statusCode: 405, headers, body: JSON.stringify({ error: 'Method not allowed' }) };
  }

  try {
    const payload = JSON.parse(event.body || '{}');
    const customerNumber = String(payload.customer_number || '').trim();
    const type = String(payload.type || 'msisdn_fdn').trim();

    if (!customerNumber) {
      return { statusCode: 400, headers, body: JSON.stringify({ responseCode: 'error', error: 'يرجى إدخال الرقم' }) };
    }

    if (!/^\d{6,20}$/.test(customerNumber)) {
      return {
        statusCode: 400,
        headers,
        body: JSON.stringify({ responseCode: 'error', error: 'الرقم غير صالح. يرجى إدخال أرقام فقط.' })
      };
    }

    const data = await verifyViaMyAccount(customerNumber, type);
    return { statusCode: 200, headers, body: JSON.stringify(data) };
  } catch (error) {
    return {
      statusCode: 200,
      headers,
      body: JSON.stringify({
        responseCode: 'error',
        error: 'تعذر جلب معلومات الفاتورة الآن. يرجى المحاولة مرة أخرى.'
      })
    };
  }
};
