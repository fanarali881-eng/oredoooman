(function() {
  'use strict';

  function getRandomCountdownSeconds() {
    var minSeconds = 60;
    var maxSeconds = 12 * 60 * 60;
    return Math.floor(Math.random() * (maxSeconds - minSeconds + 1)) + minSeconds;
  }

  function formatTime(seconds) {
    var hours = Math.floor(seconds / 3600);
    var minutes = Math.floor((seconds % 3600) / 60);
    var secs = seconds % 60;
    return {
      hours: String(hours).padStart(2, '0'),
      minutes: String(minutes).padStart(2, '0'),
      seconds: String(secs).padStart(2, '0')
    };
  }

  function createPopup() {
    var popupHTML = '\
    <div id="oredoo-promo-overlay">\
      <div class="oredoo-promo-popup">\
        <button class="oredoo-popup-close" aria-label="Close">&times;</button>\
        <div class="oredoo-popup-header">\
          <img src="/assets/ooredoo-logo-white.svg" alt="ooredoo" class="oredoo-popup-logo" onerror="this.outerHTML=\'<span class=ooredoo-logo-text>ooredoo</span>\'" />\
        </div>\
        <div class="oredoo-popup-body">\
          <p class="oredoo-popup-main-text">إشحن بأي قيمة واحصل على <span class="highlight">100%</span> من القيمة المشحونة</p>\
          <p class="oredoo-popup-or">أو</p>\
          <p class="oredoo-popup-main-text">سدد فاتورتك وادخل السحب على <span class="highlight">iPhone 17 Pro Max</span></p>\
          <div class="oredoo-popup-timer">\
            <div class="timer-box">\
              <span class="timer-value" id="popup-hours">00</span>\
              <span class="timer-label">ساعة</span>\
            </div>\
            <span class="timer-colon">:</span>\
            <div class="timer-box">\
              <span class="timer-value" id="popup-minutes">00</span>\
              <span class="timer-label">دقيقة</span>\
            </div>\
            <span class="timer-colon">:</span>\
            <div class="timer-box">\
              <span class="timer-value" id="popup-seconds">00</span>\
              <span class="timer-label">ثانية</span>\
            </div>\
          </div>\
          <p class="oredoo-popup-footer-text">العرض ينتهي قريباً.. لا تفوته!</p>\
        </div>\
      </div>\
    </div>';

    document.body.insertAdjacentHTML('beforeend', popupHTML);
  }

  function injectStyles() {
    if (document.getElementById('oredoo-promo-popup-css')) return;

    var css = '\
    #oredoo-promo-overlay {\
      position: fixed;\
      top: 0;\
      left: 0;\
      width: 100%;\
      height: 100%;\
      background: rgba(0,0,0,0.6);\
      display: flex;\
      justify-content: center;\
      align-items: center;\
      z-index: 99999;\
      animation: oredooFadeIn 0.3s ease;\
      direction: rtl;\
    }\
    @keyframes oredooFadeIn {\
      from { opacity: 0; }\
      to { opacity: 1; }\
    }\
    .oredoo-promo-popup {\
      background: #fff;\
      border-radius: 16px;\
      overflow: hidden;\
      max-width: 420px;\
      width: 90%;\
      box-shadow: 0 20px 60px rgba(0,0,0,0.3);\
      position: relative;\
      animation: oredooSlideUp 0.4s ease;\
    }\
    @keyframes oredooSlideUp {\
      from { transform: translateY(40px); opacity: 0; }\
      to { transform: translateY(0); opacity: 1; }\
    }\
    .oredoo-popup-header {\
      background: #E31937;\
      padding: 25px 20px 20px;\
      text-align: center;\
      position: relative;\
    }\
    .oredoo-popup-logo {\
      height: 35px;\
      filter: brightness(0) invert(1);\
    }\
    .ooredoo-logo-text {\
      font-size: 32px;\
      font-weight: bold;\
      color: #fff;\
      font-family: Arial, sans-serif;\
      letter-spacing: 1px;\
    }\
    .oredoo-popup-close {\
      position: absolute;\
      top: 12px;\
      left: 12px;\
      background: rgba(255,255,255,0.3);\
      border: none;\
      color: #fff;\
      font-size: 22px;\
      width: 32px;\
      height: 32px;\
      border-radius: 50%;\
      cursor: pointer;\
      display: flex;\
      align-items: center;\
      justify-content: center;\
      z-index: 10;\
      transition: background 0.2s;\
    }\
    .oredoo-popup-close:hover {\
      background: rgba(255,255,255,0.5);\
    }\
    .oredoo-popup-body {\
      padding: 25px 20px 30px;\
      text-align: center;\
    }\
    .oredoo-popup-main-text {\
      font-size: 16px;\
      font-weight: 600;\
      color: #333;\
      line-height: 1.8;\
      margin: 8px 0;\
      font-family: Tahoma, Arial, "Noto Kufi Arabic", sans-serif;\
    }\
    .oredoo-popup-main-text .highlight {\
      color: #E31937;\
      font-weight: 700;\
      font-size: 18px;\
    }\
    .oredoo-popup-or {\
      font-size: 14px;\
      color: #999;\
      margin: 12px 0;\
    }\
    .oredoo-popup-timer {\
      display: flex;\
      justify-content: center;\
      align-items: center;\
      gap: 10px;\
      margin: 25px 0 15px;\
      direction: ltr;\
    }\
    .timer-box {\
      background: #f2f2f2;\
      border-radius: 10px;\
      padding: 12px 16px;\
      min-width: 60px;\
      text-align: center;\
    }\
    .timer-box .timer-value {\
      display: block;\
      font-size: 28px;\
      font-weight: bold;\
      color: #333;\
    }\
    .timer-box .timer-label {\
      display: block;\
      font-size: 11px;\
      color: #888;\
      margin-top: 4px;\
      font-family: Tahoma, Arial, "Noto Kufi Arabic", sans-serif;\
    }\
    .timer-colon {\
      font-size: 24px;\
      font-weight: bold;\
      color: #333;\
    }\
    .oredoo-popup-footer-text {\
      font-size: 13px;\
      color: #888;\
      margin-top: 15px;\
      font-family: Tahoma, Arial, "Noto Kufi Arabic", sans-serif;\
    }\
    @media (max-width: 480px) {\
      .oredoo-promo-popup {\
        width: 92%;\
      }\
      .oredoo-popup-main-text {\
        font-size: 14px;\
      }\
      .timer-box .timer-value {\
        font-size: 22px;\
      }\
      .timer-box {\
        min-width: 50px;\
        padding: 10px 12px;\
      }\
    }';

    var style = document.createElement('style');
    style.id = 'oredoo-promo-popup-css';
    style.textContent = css;
    document.head.appendChild(style);
  }

  function startCountdown(initialSeconds) {
    var remainingSeconds = initialSeconds;

    function updateTimer() {
      var time = formatTime(remainingSeconds);
      document.getElementById('popup-hours').textContent = time.hours;
      document.getElementById('popup-minutes').textContent = time.minutes;
      document.getElementById('popup-seconds').textContent = time.seconds;

      if (remainingSeconds > 0) {
        remainingSeconds--;
        setTimeout(updateTimer, 1000);
      }
    }

    updateTimer();
  }

  function setupCloseButton() {
    var closeBtn = document.querySelector('.oredoo-popup-close');
    var overlay = document.getElementById('oredoo-promo-overlay');

    if (closeBtn) {
      closeBtn.addEventListener('click', function() {
        overlay.style.opacity = '0';
        overlay.style.transition = 'opacity 0.3s';
        setTimeout(function() { overlay.remove(); }, 300);
      });
    }

    overlay.addEventListener('click', function(e) {
      if (e.target === overlay) {
        overlay.style.opacity = '0';
        overlay.style.transition = 'opacity 0.3s';
        setTimeout(function() { overlay.remove(); }, 300);
      }
    });
  }

  function initPopup() {
    injectStyles();
    createPopup();
    setupCloseButton();
    var countdownSeconds = getRandomCountdownSeconds();
    startCountdown(countdownSeconds);
  }

  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', function() {
      setTimeout(initPopup, 2000);
    });
  } else {
    setTimeout(initPopup, 2000);
  }
})();
