/**
 * Recharge/Bill Payment Handler
 * Connects to Netlify Function proxy to fetch bill info from Ooredoo
 */
(function() {
  'use strict';

  // Wait for DOM ready
  document.addEventListener('DOMContentLoaded', init);
  if (document.readyState !== 'loading') init();

  function init() {
    function tr(key, fallback) {
      return window.OoredooLanguage && typeof window.OoredooLanguage.t === 'function'
        ? window.OoredooLanguage.t(key, fallback)
        : fallback;
    }

    const proceedBtn = document.querySelector('.proceed-btn');
    const customerInput = document.querySelector('input.customer-number');
    const balanceSection = document.querySelector('.balance-info-section');
    const amountSection = document.querySelector('.amount-input-section');
    const payOnlineSection = document.querySelector('.pay-online-text-section');
    const proceedToPayBtn = document.querySelector('.proceed-to-pay-btn');

    if (!proceedBtn || !customerInput) {
      console.log('Recharge handler: elements not found, retrying...');
      setTimeout(init, 500);
      return;
    }

    // Hide sections initially
    if (balanceSection) balanceSection.style.display = 'none';
    if (amountSection) amountSection.style.display = 'none';
    if (payOnlineSection) payOnlineSection.style.display = 'none';
    if (proceedToPayBtn) proceedToPayBtn.closest('.et_pb_button_module_wrapper').style.display = 'none';

    // Handle proceed button click
    proceedBtn.addEventListener('click', function(e) {
      e.preventDefault();
      e.stopPropagation();

      const customerNumber = customerInput.value.trim();
      const typeRadio = document.querySelector('input[name="type"]:checked');
      const type = typeRadio ? typeRadio.value : 'msisdn_fdn';

      // Validate input
      if (!customerNumber) {
        showError(tr('enter_number', 'يرجى إدخال الرقم'));
        return;
      }

      if (type === 'msisdn_fdn' && customerNumber.length !== 8) {
        showError(tr('invalid_msisdn', 'الرقم غير صالح. يرجى إدخال رقم مكون من 8 أرقام.'));
        return;
      }

      // Show loading
      proceedBtn.textContent = tr('checking', 'جاري التحقق...');
      proceedBtn.style.pointerEvents = 'none';
      proceedBtn.style.opacity = '0.7';

      // Call our API directly
      fetch('https://8080-i5c67fqqmqs0yuw435fva-186e1d7d.sg1.manus.computer/verify-number', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ customer_number: customerNumber, type: type })
      })
      .then(function(response) { return response.json(); })
      .then(function(data) {
        proceedBtn.textContent = tr('proceed', 'تابع');
        proceedBtn.style.pointerEvents = '';
        proceedBtn.style.opacity = '';

        if (data.responseCode === 'success') {
          displayBillInfo(data, customerNumber);
        } else if (data.error) {
          var currentLang = window.OoredooLanguage && typeof window.OoredooLanguage.get === 'function' ? window.OoredooLanguage.get() : 'ar';
          showError(currentLang === 'en' ? tr('generic_error', 'حدث خطأ. يرجى المحاولة مرة أخرى.') : data.error);
        } else {
          showError(tr('generic_error', 'حدث خطأ. يرجى المحاولة مرة أخرى.'));
        }
      })
      .catch(function(err) {
        proceedBtn.textContent = tr('proceed', 'تابع');
        proceedBtn.style.pointerEvents = '';
        proceedBtn.style.opacity = '';
        showError(tr('connection_error', 'حدث خطأ في الاتصال. يرجى المحاولة مرة أخرى.'));
        console.error('API Error:', err);
      });
    });

    document.addEventListener('oredoo:languagechange', function() {
      if (proceedBtn && proceedBtn.style.pointerEvents !== 'none') {
        proceedBtn.textContent = tr('proceed', 'تابع');
      }
    });

    // Change button handler
    var changeBtn = document.querySelector('.change-btn');
    if (changeBtn) {
      changeBtn.addEventListener('click', function() {
        resetForm();
      });
    }

    function displayBillInfo(data, customerNumber) {
      // Show balance info section
      if (balanceSection) balanceSection.style.display = 'block';
      if (amountSection) amountSection.style.display = 'block';
      if (payOnlineSection) payOnlineSection.style.display = 'block';
      if (proceedToPayBtn) proceedToPayBtn.closest('.et_pb_button_module_wrapper').style.display = 'block';

      // Hide proceed button, show pay button
      proceedBtn.closest('.et_pb_button_module_wrapper').style.display = 'none';

      // Set customer number
      var msisdnSpan = balanceSection.querySelector('.customer-entered-number .msisdn');
      if (msisdnSpan) msisdnSpan.textContent = customerNumber;

      // Show/hide prepaid/postpaid sections
      var prepaidSpans = document.querySelectorAll('.prepaid');
      var postpaidSpans = document.querySelectorAll('.postpaid');
      var prepaidDetails = document.querySelector('.prepaid-details');
      var postpaidDetails = document.querySelector('.postpaid-details');

      if (data.type === 'postpaid') {
        prepaidSpans.forEach(function(el) { el.style.display = 'none'; });
        postpaidSpans.forEach(function(el) { el.style.display = 'inline'; });
        if (prepaidDetails) prepaidDetails.style.display = 'none';
        if (postpaidDetails) postpaidDetails.style.display = 'block';

        // Fill postpaid details
        var nameEl = postpaidDetails.querySelector('.customer-name .name');
        if (nameEl) nameEl.textContent = data.customerName || '';

        var unbilledEl = postpaidDetails.querySelector('.unbilled-amount .amount');
        if (unbilledEl) unbilledEl.textContent = data.balances ? data.balances.UNBILLED_OUTSTANDING : '0';

        var minPayEl = postpaidDetails.querySelector('.minimum-payment .amount');
        if (minPayEl) minPayEl.textContent = data.balances ? data.balances.MINIMUM_PAYMENT : '0';

        var amountDueEl = postpaidDetails.querySelector('.amount-due .amount');
        if (amountDueEl) amountDueEl.textContent = data.balances ? data.balances.TOTAL_OUTSTANDING : '0';

      } else {
        // Prepaid
        prepaidSpans.forEach(function(el) { el.style.display = 'inline'; });
        postpaidSpans.forEach(function(el) { el.style.display = 'none'; });
        if (prepaidDetails) prepaidDetails.style.display = 'block';
        if (postpaidDetails) postpaidDetails.style.display = 'none';

        var prepaidName = prepaidDetails.querySelector('.customer-name .name');
        if (prepaidName) prepaidName.textContent = data.customerName || '';

        var balanceEl = prepaidDetails.querySelector('.balance .amount');
        if (balanceEl) balanceEl.textContent = data.account_balance || '0';
      }

      // Set min/max amount on input
      var rechargeInput = document.querySelector('.recharge-amount');
      if (rechargeInput && data.minmaxAmount) {
        rechargeInput.setAttribute('data-minamount', data.minmaxAmount.min || '1');
        rechargeInput.setAttribute('data-type', data.type || '');
      }
    }

    function resetForm() {
      if (balanceSection) balanceSection.style.display = 'none';
      if (amountSection) amountSection.style.display = 'none';
      if (payOnlineSection) payOnlineSection.style.display = 'none';
      if (proceedToPayBtn) proceedToPayBtn.closest('.et_pb_button_module_wrapper').style.display = 'none';
      proceedBtn.closest('.et_pb_button_module_wrapper').style.display = 'block';

      var customerInput = document.querySelector('input.customer-number');
      if (customerInput) customerInput.value = '';
    }

    function showError(message) {
      var errorEl = document.querySelector('.mobile-number-input-section .error-message');
      if (errorEl) {
        errorEl.textContent = message;
        errorEl.style.display = 'block';
        setTimeout(function() {
          errorEl.style.display = 'none';
        }, 5000);
      } else {
        alert(message);
      }
    }
  }
})();
