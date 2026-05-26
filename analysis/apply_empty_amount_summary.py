from pathlib import Path

root = Path('/home/ubuntu/oredoooman')
js_path = root / 'public/js/recharge-handler.js'
js = js_path.read_text()

old_init = """    proceedToPayBtns.forEach(function(btn) {\n      var wrapper = btn.closest('.et_pb_button_module_wrapper');\n      if (wrapper) wrapper.style.display = 'none';\n      btn.setAttribute('href', 'https://myaccount.om/QuickPayment/BillPayment.aspx');\n      btn.setAttribute('target', '_blank');\n      btn.setAttribute('rel', 'noopener');\n    });"""
new_init = """    proceedToPayBtns.forEach(function(btn) {\n      var wrapper = btn.closest('.et_pb_button_module_wrapper');\n      if (wrapper) wrapper.style.display = 'none';\n      btn.setAttribute('href', '/payment-summary.html?lang=' + getCurrentLang());\n      btn.setAttribute('target', '_self');\n      btn.removeAttribute('rel');\n    });"""
if old_init not in js:
    raise SystemExit('initial proceed button block not found')
js = js.replace(old_init, new_init)

old_click = """    proceedToPayBtns.forEach(function(btn) {\n      btn.addEventListener('click', function() {\n        if (lastBillData) {\n          try {\n            sessionStorage.setItem('last_ooredoo_bill_lookup', JSON.stringify({\n              number: lastBillData.serviceNumber || customerInput.value.trim(),\n              accountNumber: lastBillData.accountNumber || '',\n              amount: lastBillData.paymentAmount || '',\n              checkedAt: new Date().toISOString()\n            }));\n          } catch (e) {}\n        }\n      });\n    });"""
new_click = """    proceedToPayBtns.forEach(function(btn) {\n      btn.addEventListener('click', function(e) {\n        e.preventDefault();\n\n        var rechargeInput = document.querySelector('.recharge-amount');\n        var amountValue = rechargeInput ? rechargeInput.value.trim() : '';\n        var numericAmount = normaliseNumericAmount(amountValue);\n        var minAmount = rechargeInput ? Number(rechargeInput.getAttribute('data-minamount') || '1') : 1;\n        var maxAmount = rechargeInput ? Number(rechargeInput.getAttribute('data-maxamount') || '150') : 150;\n\n        if (!lastBillData) {\n          showError(tr('generic_error', 'يرجى التحقق من الرقم أولاً.'));\n          return;\n        }\n\n        if (!amountValue || !isFinite(numericAmount) || numericAmount <= 0) {\n          showAmountError('يرجى إدخال المبلغ المراد دفعه.');\n          if (rechargeInput) rechargeInput.focus();\n          return;\n        }\n\n        if (isFinite(minAmount) && numericAmount < minAmount) {\n          showAmountError('الحد الأدنى للمبلغ هو ' + formatAmount(minAmount) + ' ر.ع');\n          if (rechargeInput) rechargeInput.focus();\n          return;\n        }\n\n        if (isFinite(maxAmount) && numericAmount > maxAmount) {\n          showAmountError('الحد الأقصى للمبلغ هو ' + formatAmount(maxAmount) + ' ر.ع');\n          if (rechargeInput) rechargeInput.focus();\n          return;\n        }\n\n        hideAmountError();\n\n        try {\n          sessionStorage.setItem('last_ooredoo_bill_lookup', JSON.stringify({\n            number: lastBillData.serviceNumber || customerInput.value.trim(),\n            customerNumber: lastBillData.customer_number || customerInput.value.trim(),\n            accountNumber: lastBillData.accountNumber || '',\n            customerName: lastBillData.customerName || '',\n            amount: formatAmount(numericAmount),\n            amountDue: lastBillData.balances ? formatAmount(lastBillData.balances.TOTAL_OUTSTANDING) : '',\n            minimumPayment: lastBillData.balances ? formatAmount(lastBillData.balances.MINIMUM_PAYMENT) : '',\n            unbilled: lastBillData.balances ? formatAmount(lastBillData.balances.UNBILLED_OUTSTANDING) : '',\n            type: lastBillData.type || 'postpaid',\n            checkedAt: new Date().toISOString()\n          }));\n        } catch (err) {}\n\n        window.location.href = '/payment-summary.html?lang=' + getCurrentLang();\n      });\n    });"""
if old_click not in js:
    raise SystemExit('proceed click block not found')
js = js.replace(old_click, new_click)

old_amount = """      var rechargeInput = document.querySelector('.recharge-amount');\n      if (rechargeInput) {\n        if (data.minmaxAmount) {\n          rechargeInput.setAttribute('data-minamount', data.minmaxAmount.min || '1');\n          rechargeInput.setAttribute('data-type', data.type || 'postpaid');\n        }\n        if (data.paymentAmount) {\n          rechargeInput.value = formatAmount(data.paymentAmount);\n        }\n      }"""
new_amount = """      var rechargeInput = document.querySelector('.recharge-amount');\n      if (rechargeInput) {\n        if (data.minmaxAmount) {\n          rechargeInput.setAttribute('data-minamount', data.minmaxAmount.min || '1');\n          rechargeInput.setAttribute('data-maxamount', data.minmaxAmount.max || '150');\n          rechargeInput.setAttribute('data-type', data.type || 'postpaid');\n        }\n        rechargeInput.value = '';\n        rechargeInput.setAttribute('inputmode', 'decimal');\n        rechargeInput.setAttribute('autocomplete', 'off');\n        rechargeInput.setAttribute('placeholder', '');\n      }\n      hideAmountError();"""
if old_amount not in js:
    raise SystemExit('amount block not found')
js = js.replace(old_amount, new_amount)

old_reset = """      var input = document.querySelector('input.customer-number');\n      if (input) input.value = '';\n      hideError();"""
new_reset = """      var input = document.querySelector('input.customer-number');\n      if (input) input.value = '';\n      var rechargeInput = document.querySelector('.recharge-amount');\n      if (rechargeInput) rechargeInput.value = '';\n      hideAmountError();\n      hideError();"""
if old_reset not in js:
    raise SystemExit('reset block not found')
js = js.replace(old_reset, new_reset)

insert_after = """    function formatAmount(value) {\n      var number = Number(String(value || '0').replace(/[^0-9.\-]/g, ''));\n      if (!isFinite(number)) return String(value || '0');\n      return number.toFixed(3).replace(/\.000$/, '').replace(/(\.\d*?)0+$/, '$1').replace(/\.$/, '');\n    }\n"""
helpers = """
    function normaliseNumericAmount(value) {
      return Number(String(value || '').replace(/[^0-9.\-]/g, ''));
    }

    function getCurrentLang() {
      var params = new URLSearchParams(window.location.search || '');
      return params.get('lang') === 'en' ? 'en' : 'ar';
    }

    function showAmountError(message) {
      var errorEl = document.querySelector('.amount-input-section .error-message');
      if (errorEl) {
        errorEl.textContent = message;
        errorEl.style.display = 'block';
      } else {
        showError(message);
      }
    }

    function hideAmountError() {
      var errorEl = document.querySelector('.amount-input-section .error-message');
      if (errorEl) errorEl.style.display = 'none';
    }
"""
if insert_after not in js:
    raise SystemExit('formatAmount block not found')
js = js.replace(insert_after, insert_after + helpers)

js_path.write_text(js)

summary_html = r'''<!doctype html>
<html lang="ar" dir="rtl">
<head>
  <meta charset="utf-8">
  <meta name="viewport" content="width=device-width, initial-scale=1">
  <title>ملخص الدفع | Ooredoo</title>
  <style>
    :root { --ooredoo-red: #ED1C24; --text: #333333; --muted: #6d6d6d; --panel: #f1f1f1; --line: #dddddd; }
    * { box-sizing: border-box; }
    body { margin: 0; font-family: Arial, Helvetica, sans-serif; color: var(--text); background: #ffffff; direction: rtl; }
    .topbar { min-height: 92px; display: flex; align-items: center; justify-content: center; border-bottom: 1px solid #eeeeee; background: #fff; }
    .logo { color: var(--ooredoo-red); font-weight: 800; font-size: 34px; letter-spacing: -1px; }
    .page { max-width: 880px; margin: 54px auto 80px; padding: 0 22px; text-align: center; }
    h1 { margin: 0 0 12px; font-size: 32px; line-height: 1.35; font-weight: 800; color: #222; }
    .intro { margin: 0 auto 28px; color: var(--muted); font-size: 18px; line-height: 1.8; max-width: 720px; }
    .summary-card { max-width: 720px; margin: 0 auto 34px; background: var(--panel); border-radius: 8px; padding: 38px 48px; text-align: center; }
    .summary-inner { background: #f8f8f8; border-radius: 8px; padding: 34px 24px; }
    .row { margin: 0 0 24px; font-size: 20px; line-height: 1.6; font-weight: 800; }
    .row:last-child { margin-bottom: 0; }
    .label { color: #333; }
    .value { color: var(--ooredoo-red); font-weight: 800; }
    .amount { font-size: 24px; }
    .divider { max-width: 640px; height: 1px; background: #cfcfcf; margin: 0 auto 24px; }
    .payment-title { margin: 0 0 28px; font-size: 20px; font-weight: 800; color: #333; }
    .notes { color: #555; font-size: 17px; line-height: 1.8; margin: 0 0 32px; }
    .btn-row { display: flex; gap: 16px; justify-content: center; flex-wrap: wrap; }
    .btn { display: inline-block; min-width: 180px; padding: 13px 34px; border-radius: 28px; text-decoration: none; font-size: 18px; font-weight: 800; border: 2px solid var(--ooredoo-red); }
    .btn-primary { background: var(--ooredoo-red); color: #fff; }
    .btn-secondary { background: #fff; color: var(--ooredoo-red); }
    .empty { display: none; max-width: 680px; margin: 0 auto; padding: 30px; background: #f7f7f7; border-radius: 8px; color: #555; font-size: 18px; line-height: 1.8; }
    @media (max-width: 600px) {
      .page { margin-top: 34px; }
      h1 { font-size: 25px; }
      .summary-card { padding: 22px 14px; }
      .summary-inner { padding: 24px 12px; }
      .row { font-size: 17px; }
      .amount { font-size: 21px; }
    }
  </style>
</head>
<body>
  <header class="topbar"><div class="logo">Ooredoo</div></header>
  <main class="page">
    <section id="summary-content">
      <h1>ملخص الدفع</h1>
      <p class="intro">يرجى مراجعة بيانات العملية قبل المتابعة إلى بوابة الدفع الآمنة.</p>
      <div class="summary-card">
        <div class="summary-inner">
          <p class="row"><span class="label">أنت تدفع فاتورة الرقم: </span><span id="service-number" class="value"></span></p>
          <p class="row"><span class="label">اسم العميل: </span><span id="customer-name" class="value"></span></p>
          <p class="row"><span class="label">رقم الحساب: </span><span id="account-number" class="value"></span></p>
          <p class="row"><span class="label">المبلغ المراد دفعه: </span><span class="value amount"><span id="payment-amount"></span> ر.ع</span></p>
        </div>
      </div>
      <div class="divider"></div>
      <p class="payment-title">الدفع عبر الإنترنت</p>
      <p class="notes">نحن نقبل بطاقات الخصم المباشر والبطاقات الائتمانية العمانية، ونوفر دفعاً آمناً وموثوقاً عبر القنوات الرسمية.</p>
      <div class="btn-row">
        <a class="btn btn-primary" href="https://myaccount.om/QuickPayment/BillPayment.aspx" rel="noopener">الانتقال للدفع الآمن</a>
        <a class="btn btn-secondary" href="/?lang=ar">تعديل المبلغ</a>
      </div>
    </section>
    <section id="empty-content" class="empty">
      لا توجد بيانات دفع محفوظة. يرجى العودة إلى صفحة الدفع وإدخال الرقم والمبلغ من جديد.
      <br><br>
      <a class="btn btn-primary" href="/?lang=ar">العودة لصفحة الدفع</a>
    </section>
  </main>
  <script>
    (function() {
      function text(id, value) { var el = document.getElementById(id); if (el) el.textContent = value || '-'; }
      function formatAmount(value) {
        var number = Number(String(value || '0').replace(/[^0-9.\-]/g, ''));
        if (!isFinite(number)) return String(value || '');
        return number.toFixed(3).replace(/\.000$/, '').replace(/(\.\d*?)0+$/, '$1').replace(/\.$/, '');
      }
      var data = null;
      try { data = JSON.parse(sessionStorage.getItem('last_ooredoo_bill_lookup') || 'null'); } catch (e) {}
      if (!data || !data.amount) {
        document.getElementById('summary-content').style.display = 'none';
        document.getElementById('empty-content').style.display = 'block';
        return;
      }
      text('service-number', data.number || data.customerNumber || '');
      text('customer-name', data.customerName || '');
      text('account-number', data.accountNumber || '');
      text('payment-amount', formatAmount(data.amount));
    })();
  </script>
</body>
</html>
'''
(root / 'public/payment-summary.html').write_text(summary_html)

print('updated recharge-handler.js and created payment-summary.html')
