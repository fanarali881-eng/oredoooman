/*
 * Ooredoo static language switcher
 * Enables Arabic/English switching for the static Netlify page.
 */
(function () {
  'use strict';

  var STORAGE_KEY = 'oredoo_site_language';

  var dictionary = {
    'اشحن رصيدك وادفع فواتيرك بسهولة مع أوريدو': 'Recharge your balance and pay your bills easily with Ooredoo',
    'اكتشف كيفية شحن رصيدك ودفع فواتيرك مع أوريدو بكل سهولة. ابدأ الآن واستمتع بتجربة خالية من التعقيد.': 'Discover how to recharge your balance and pay your Ooredoo bills easily. Start now and enjoy a simple experience.',
    'مخزن موقع': 'Store',
    'إعادة شحن سريعة': 'Quick Recharge',
    'سريعة بيلباي': 'Quick Bill Pay',
    'اختر صفحة': 'Select Page',
    'Personal': 'Personal',
    'Business': 'Business',
    'Ooredoo website >': 'Ooredoo website >',
    'O Plus (آجل الدفع)': 'O Plus (Postpaid)',
    'هلا (مسبق الدفع)': 'Hala (Prepaid)',
    'باقات زائر': 'Visitor Packs',
    'باقات منزلي': 'Home Plans',
    'الأجهزة': 'Devices',
    'الدفع السريع': 'Quick Payment',
    'تسوق': 'Shop',
    'إعادة شحن الرصيد / دفع الفواتير': 'Recharge / Bill Payment',
    'سداد فاتورة أو إعادة شحن': 'Pay a bill or recharge',
    'ادخل رقم Ooredoo أو رقم الخط الثابت أو رقم السجل التجاري لتتمكن من إعادة شحن رصيدك أو لسداد فاتورتك الشهرية. للأرقام التي تم إنهاؤها يمكنك استخدام رقم الحساب.': 'Enter your Ooredoo number, fixed line number, or commercial registration number to recharge your balance or pay your monthly bill. For terminated numbers, you can use the account number.',
    'رقم الهاتف النقال / الهاتف الثابت': 'Mobile / Fixed Line Number',
    'رقم الحساب': 'Account Number',
    'ادخل رقم السجل التجاري': 'Enter Commercial Registration Number',
    'رقم الهاتف النقال / الهاتف الثابت / رقم الحساب': 'Mobile / Fixed Line / Account Number',
    'سيتم ارسال رمز التحقق لمرة واحدة إلى المسؤول المعني بالاتصالات للتحقق': 'A one-time password will be sent to the telecom administrator for verification.',
    'الرقم غير صالح. يرجى تجربة رقم هاتف نقال أو ثابت أو  رقم حساب Ooredoo.': 'The number is invalid. Please try an Ooredoo mobile, fixed line, or account number.',
    'ادخل رمز المرور لمرة واحدة(OTP) للتحقق': 'Enter the one-time password (OTP) for verification',
    'الرمز السري غير صحيح. حاول مرة أخرى.': 'The code is incorrect. Please try again.',
    'تم إرسال رمز المرور لمرة واحدة (OTP) إلى رقمك': 'The one-time password (OTP) has been sent to your number.',
    'تم ارسال رمز التحقق لمرة واحدة (OTP) إلى الرقم': 'The one-time password (OTP) has been sent to number',
    'إعادة إرسال كلمة المرور التي تصلح لمرة واحدة': 'Resend one-time password',
    'إعادة شحن الرصيد': 'Recharge balance',
    'أنت تدفع فاتورة الرقم': 'You’re paying the bill of',
    'تغيير': 'Change',
    'اسم العميل:': 'Customer name:',
    'رقم الحساب:': 'Account number:',
    'الرصيد الحالي:': 'Current balance:',
    'المبلغ غير المفوتر:': 'Unbilled amount:',
    'الحد الأدنى للدفع:': 'Minimum payment:',
    'المبلغ المستحق:': 'Amount due:',
    'ر.ع': 'OMR',
    'ادخل قيمة الرصيد المراد شحنه (ريال عماني)': 'Enter recharge amount (OMR)',
    'أدخل المبلغ المراد دفعه لسداد فاتورتك (ريال عماني)': 'Enter the amount to pay your bill (OMR)',
    'الحد الأدنى للمبلغ هو 1 ‒.': 'The minimum amount is OMR 1.',
    'تابع': 'Proceed',
    'تحقق وتابع': 'Verify and proceed',
    'الدفع عبر الإنترنت': 'Pay online',
    '1) نحن نقبل بطاقات الخصم المباشر والبطاقات الائتمانية العمانية.': '1) We accept Omani debit and credit cards.',
    '2) نوفر دفع آمن وموثوق.': '2) We provide secure and reliable payment.',
    'متابعة الدفع': 'Proceed to pay',
    'المتابعة للدفع': 'Proceed to pay',
    'يعمل بواسطة': 'Powered by',
    'نحن نقبل': 'We accept',
    'رقم السجل التجاري للشركة:': 'Company commercial registration number:',
    'تعديل': 'Edit',
    'نظرة عامة على الحساب': 'Account overview',
    'مراجعة وتعديل المبالغ المستحقة على حسابك': 'Review and modify outstanding amounts on your account.',
    'تحديد الكل': 'Select all',
    'إلغاء تحديد الكل': 'Unselect all',
    'تم تحديد': 'Selected',
    'حساب من': 'account(s) from',
    'حساب': 'account(s)',
    'إجمالي المبلغ المفوتر': 'Total billed amount',
    'الحساب': 'Account',
    'المبلغ المفوتر:': 'Billed amount:',
    'المبلغ المفوتر': 'Billed amount',
    'المبلغ': 'Amount',
    'ريال عماني': 'OMR',
    'حفظ': 'Save',
    'إلغاء': 'Cancel',
    'عذرًا!': 'Sorry!',
    'معذرة. لا يمكننا العثور على رقم الهاتف النقال/ الخط الثابت/ الحساب الذي أدخلته.': 'Sorry. We could not find the mobile, fixed line, or account number you entered.',
    'النقال': 'Mobile',
    'باقات  O Plus': 'O Plus plans',
    'باقات للبيانات فقط': 'Data-only plans',
    'قم بالترقية إلى O Plus(آجل الدفع)': 'Upgrade to O Plus (Postpaid)',
    'حول لـ Ooredoo': 'Switch to Ooredoo',
    'تفعيل الشريحة': 'Activate SIM',
    'باقات هلا': 'Hala plans',
    'إعادة تعبئة هلا': 'Hala recharge',
    'الإنترنت المنزلي': 'Home Internet',
    'الهواتف الذكية والأجهزة اللوحية': 'Smartphones and tablets',
    'الإكسسوارات والأجهزة': 'Accessories and devices',
    'الدعم': 'Support',
    'صالات Ooredoo': 'Ooredoo stores',
    'حسابي': 'My account',
    'تتبع الطلب': 'Track order',
    'تسجيل الدخول / التسجيل': 'Login / Register',
    'قم بتحميل تطبيقنا': 'Download our app',
    'قم بإدارة اتصالاتك بكل سهولة': 'Manage your connections with ease',
    'Ooredoo عمان ©2023': 'Ooredoo Oman ©2023',
    'جميع الحقوق محفوظة': 'All rights reserved',
    'الشروط والأحكام': 'Terms and conditions',
    'سياسة الخصوصية': 'Privacy policy',
    'بحث عن:': 'Search for:',
    'العربية': 'Arabic'
  };

  var attributeDictionary = {
    'ادخل رقم السجل التجاري للشركة': 'Enter the company commercial registration number',
    'البحث باستخدا رقم الهاتف أو رقم الحساب': 'Search by phone number or account number',
    '… بحث': 'Search …',
    'بحث عن:': 'Search for:',
    'العربية': 'Arabic',
    'إعادة شحن الرصيد / دفع الفواتير': 'Recharge / Bill Payment',
    'اشحن رصيدك وادفع فواتيرك بسهولة مع أوريدو': 'Recharge your balance and pay your bills easily with Ooredoo'
  };

  var runtimeMessages = {
    ar: {
      enter_number: 'يرجى إدخال الرقم',
      invalid_msisdn: 'الرقم غير صالح. يرجى إدخال رقم مكون من 8 أرقام.',
      checking: 'جاري التحقق...',
      proceed: 'تابع',
      generic_error: 'حدث خطأ. يرجى المحاولة مرة أخرى.',
      connection_error: 'حدث خطأ في الاتصال. يرجى المحاولة مرة أخرى.'
    },
    en: {
      enter_number: 'Please enter the number.',
      invalid_msisdn: 'Invalid number. Please enter an 8-digit number.',
      checking: 'Checking...',
      proceed: 'Proceed',
      generic_error: 'An error occurred. Please try again.',
      connection_error: 'A connection error occurred. Please try again.'
    }
  };

  var reverseDictionary = {};
  var reverseAttributeDictionary = {};

  Object.keys(dictionary).forEach(function (arabicText) {
    reverseDictionary[dictionary[arabicText]] = arabicText;
  });

  Object.keys(attributeDictionary).forEach(function (arabicText) {
    reverseAttributeDictionary[attributeDictionary[arabicText]] = arabicText;
  });

  function normalizeLang(lang) {
    lang = String(lang || '').toLowerCase();
    return lang === 'en' || lang === 'english' ? 'en' : 'ar';
  }

  function getUrlLanguage() {
    var params = new URLSearchParams(window.location.search);
    var lang = params.get('lang');
    if (lang === 'en' || lang === 'ar') return lang;
    return null;
  }

  function getStoredLanguage() {
    try {
      return normalizeLang(localStorage.getItem(STORAGE_KEY));
    } catch (e) {
      return 'ar';
    }
  }

  function getCurrentLanguage() {
    return window.__oredooCurrentLanguage || getUrlLanguage() || getStoredLanguage() || 'ar';
  }

  function buildLanguageUrl(lang) {
    var url = new URL(window.location.href);
    url.searchParams.set('lang', lang);
    return url.pathname + url.search + url.hash;
  }

  function keepOuterWhitespace(original, replacement) {
    var leading = original.match(/^\s*/)[0];
    var trailing = original.match(/\s*$/)[0];
    return leading + replacement + trailing;
  }

  function updateDocumentMetadata(lang) {
    var isEnglish = lang === 'en';
    document.documentElement.lang = lang;
    document.documentElement.dir = isEnglish ? 'ltr' : 'rtl';
    document.body.classList.toggle('ltr', isEnglish);
    document.body.classList.toggle('rtl', !isEnglish);
    document.title = isEnglish ? dictionary['اشحن رصيدك وادفع فواتيرك بسهولة مع أوريدو'] : 'اشحن رصيدك وادفع فواتيرك بسهولة مع أوريدو';

    var description = document.querySelector('meta[name="description"]');
    if (description) {
      description.setAttribute('content', isEnglish ? dictionary['اكتشف كيفية شحن رصيدك ودفع فواتيرك مع أوريدو بكل سهولة. ابدأ الآن واستمتع بتجربة خالية من التعقيد.'] : 'اكتشف كيفية شحن رصيدك ودفع فواتيرك مع أوريدو بكل سهولة. ابدأ الآن واستمتع بتجربة خالية من التعقيد.');
    }
  }

  function translateTextNodes(lang) {
    var walker = document.createTreeWalker(document.body, NodeFilter.SHOW_TEXT, {
      acceptNode: function (node) {
        var parent = node.parentElement;
        if (!parent) return NodeFilter.FILTER_REJECT;
        var tag = parent.tagName;
        if (tag === 'SCRIPT' || tag === 'STYLE' || tag === 'NOSCRIPT') return NodeFilter.FILTER_REJECT;
        if (!node.nodeValue || !node.nodeValue.trim()) return NodeFilter.FILTER_REJECT;
        return NodeFilter.FILTER_ACCEPT;
      }
    });

    var nodes = [];
    var current;
    while ((current = walker.nextNode())) nodes.push(current);

    nodes.forEach(function (node) {
      var compactText = node.nodeValue.replace(/\s+/g, ' ').trim();
      if (!compactText) return;

      if (lang === 'en' && dictionary[compactText]) {
        node.nodeValue = keepOuterWhitespace(node.nodeValue, dictionary[compactText]);
      } else if (lang === 'ar' && reverseDictionary[compactText]) {
        node.nodeValue = keepOuterWhitespace(node.nodeValue, reverseDictionary[compactText]);
      }
    });
  }

  function translateAttributes(lang) {
    var attrs = ['placeholder', 'title', 'alt', 'aria-label', 'data-placeholder', 'content'];
    document.querySelectorAll('*').forEach(function (el) {
      attrs.forEach(function (attr) {
        if (!el.hasAttribute(attr)) return;
        var value = el.getAttribute(attr);
        var compactValue = value.replace(/\s+/g, ' ').trim();
        if (lang === 'en' && attributeDictionary[compactValue]) {
          el.setAttribute(attr, attributeDictionary[compactValue]);
        } else if (lang === 'ar' && reverseAttributeDictionary[compactValue]) {
          el.setAttribute(attr, reverseAttributeDictionary[compactValue]);
        }
      });
    });
  }

  function setupSwitcherLinks(lang) {
    var nextLang = lang === 'en' ? 'ar' : 'en';
    var switcherText = lang === 'en' ? 'العربية' : 'English';
    var title = lang === 'en' ? 'العربية' : 'English';
    var href = buildLanguageUrl(nextLang);

    document.querySelectorAll('.store-switcher, .english-store, .wpml-ls-menu-item a').forEach(function (link) {
      link.textContent = switcherText;
      link.setAttribute('href', href);
      link.setAttribute('title', title);
      link.setAttribute('lang', nextLang);
      link.setAttribute('dir', nextLang === 'ar' ? 'rtl' : 'ltr');
      link.classList.add('oredoo-language-switcher-link');

      if (!link.dataset.languageSwitcherBound) {
        link.dataset.languageSwitcherBound = 'true';
        link.addEventListener('click', function (event) {
          event.preventDefault();
          var targetLang = getCurrentLanguage() === 'en' ? 'ar' : 'en';
          setLanguage(targetLang, true);
        });
      }
    });
  }

  function injectLanguageCss() {
    if (document.getElementById('oredoo-language-switcher-css')) return;
    var style = document.createElement('style');
    style.id = 'oredoo-language-switcher-css';
    style.textContent = [
      'html[lang="en"] body{direction:ltr;}',
      'html[lang="en"] .et_pb_text_align_right{text-align:left!important;}',
      'html[lang="en"] .type-radio-btn-section{direction:ltr;}',
      'html[lang="en"] .type-radio-btn-section>div{margin-left:0;margin-right:24px;}',
      'html[lang="en"] .prepaid-top-section, html[lang="en"] .shahry_plans_section{direction:ltr;}',
      'html[lang="en"] .footer_arrow_symbol{display:inline-block;transform:rotate(180deg);}',
      'html[lang="en"] .menu_lang_switch .store-switcher, html[lang="en"] .language_oredo a{font-weight:700;}',
      '.oredoo-language-switcher-link{letter-spacing:normal!important;text-transform:none!important;unicode-bidi:isolate;white-space:nowrap;}',
      '.oredoo-language-switcher-link[lang="ar"]{direction:rtl;font-family:Tahoma,Arial,"Noto Kufi Arabic",sans-serif!important;}',
      '.oredoo-language-switcher-link[lang="en"]{direction:ltr;}',
      'html[lang="ar"] body{direction:rtl;}'
    ].join('\n');
    document.head.appendChild(style);
  }

  function applyLanguage(lang) {
    lang = normalizeLang(lang);
    window.__oredooCurrentLanguage = lang;
    updateDocumentMetadata(lang);
    translateTextNodes(lang);
    translateAttributes(lang);
    setupSwitcherLinks(lang);
    injectLanguageCss();
  }

  function setLanguage(lang, updateUrl) {
    lang = normalizeLang(lang);
    try {
      localStorage.setItem(STORAGE_KEY, lang);
      localStorage.setItem('siteLang', lang);
    } catch (e) {}

    applyLanguage(lang);

    if (updateUrl && window.history && window.history.replaceState) {
      window.history.replaceState({}, '', buildLanguageUrl(lang));
    }

    document.dispatchEvent(new CustomEvent('oredoo:languagechange', { detail: { lang: lang } }));
  }

  window.OoredooLanguage = {
    get: getCurrentLanguage,
    set: setLanguage,
    apply: applyLanguage,
    t: function (key, fallback) {
      var lang = getCurrentLanguage();
      return (runtimeMessages[lang] && runtimeMessages[lang][key]) || fallback || key;
    }
  };

  document.addEventListener('DOMContentLoaded', function () {
    setLanguage(getUrlLanguage() || getStoredLanguage(), false);
  });
})();
