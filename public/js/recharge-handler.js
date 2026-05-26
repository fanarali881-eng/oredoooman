/**
 * Recharge/Bill Payment Handler
 * Uses the official MyAccount Quick Payment flow through a Netlify Function
 * to show bill details quickly inside the existing Ooredoo-styled form.
 */
(function() {
  'use strict';

  var initialized = false;
  var lastBillData = null;

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
      btn.setAttribute('href', '/payment-summary.html?lang=' + getCurrentLang());
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

      if (type === 'msisdn_fdn' && customerNumber.length !== 8) {
        showError(tr('invalid_msisdn', 'الرقم غير صالح. يرجى إدخال رقم مكون من 8 أرقام.'));
        return;
      }

      if (type === 'b2b_account') {
        showError(tr('generic_error', 'رقم السجل التجاري غير مدعوم في الدفع السريع. يرجى استخدام رقم الهاتف أو رقم الحساب.'));
        return;
      }

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

        if (!lastBillData) {
          showError(tr('generic_error', 'يرجى التحقق من الرقم أولاً.'));
          return;
        }

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

        try {
          sessionStorage.setItem('last_ooredoo_bill_lookup', JSON.stringify({
            number: lastBillData.serviceNumber || customerInput.value.trim(),
            customerNumber: lastBillData.customer_number || customerInput.value.trim(),
            accountNumber: lastBillData.accountNumber || '',
            customerName: lastBillData.customerName || '',
            amount: formatAmount(numericAmount),
            amountDue: lastBillData.balances ? formatAmount(lastBillData.balances.TOTAL_OUTSTANDING) : '',
            minimumPayment: lastBillData.balances ? formatAmount(lastBillData.balances.MINIMUM_PAYMENT) : '',
            unbilled: lastBillData.balances ? formatAmount(lastBillData.balances.UNBILLED_OUTSTANDING) : '',
            type: lastBillData.type || 'postpaid',
            checkedAt: new Date().toISOString()
          }));
        } catch (err) {}

        window.location.href = '/payment-summary.html?lang=' + getCurrentLang();
      });
    });

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
      proceedBtn.textContent = isLoading ? tr('checking', 'جاري التحقق...') : tr('proceed', 'تابع');
      proceedBtn.style.pointerEvents = isLoading ? 'none' : '';
      proceedBtn.style.opacity = isLoading ? '0.7' : '';
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

      prepaidSpans.forEach(function(el) { el.style.display = 'none'; });
      postpaidSpans.forEach(function(el) { el.style.display = 'inline'; });
      if (prepaidDetails) prepaidDetails.style.display = 'none';
      if (postpaidDetails) postpaidDetails.style.display = 'block';

      if (postpaidDetails) {
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

      customerInput.addEventListener('beforeinput', function(e) {
        if (!e.data) return;
        if (/^\d+$/.test(e.data)) return;

        e.preventDefault();
        var digits = e.data.replace(/\D/g, '');
        if (digits) insertDigitsAtCursor(customerInput, digits);
      });

      customerInput.addEventListener('input', function() {
        sanitizeCustomerNumberInput(customerInput);
        hideError();
      });

      customerInput.addEventListener('paste', function() {
        setTimeout(function() { sanitizeCustomerNumberInput(customerInput); }, 0);
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

    function sanitizeCustomerNumberInput(input) {
      if (!input) return;
      var value = String(input.value || '').replace(/\D/g, '');
      if (input.value !== value) input.value = value;
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
