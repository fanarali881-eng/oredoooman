(function() {
  'use strict';

  // Generate random countdown time (less than 12 hours in seconds)
  function getRandomCountdownSeconds() {
    const minSeconds = 60; // 1 minute
    const maxSeconds = 12 * 60 * 60; // 12 hours
    return Math.floor(Math.random() * (maxSeconds - minSeconds + 1)) + minSeconds;
  }

  // Format time for display
  function formatTime(seconds) {
    const hours = Math.floor(seconds / 3600);
    const minutes = Math.floor((seconds % 3600) / 60);
    const secs = seconds % 60;
    
    return {
      hours: String(hours).padStart(2, '0'),
      minutes: String(minutes).padStart(2, '0'),
      seconds: String(secs).padStart(2, '0')
    };
  }

  // Create and inject popup HTML
  function createPopup() {
    const popupHTML = `
      <div id="oredoo-promo-overlay" class="oredoo-promo-overlay">
        <div class="oredoo-promo-popup">
          <button class="oredoo-popup-close" aria-label="Close popup">&times;</button>
          
          <div class="oredoo-popup-content">
            <!-- Ooredoo Logo -->
            <div class="oredoo-popup-logo">
              <svg viewBox="0 0 200 60" xmlns="http://www.w3.org/2000/svg">
                <text x="10" y="45" font-size="40" font-weight="bold" fill="#E31937">ooredoo</text>
              </svg>
            </div>
            
            <!-- Main Text -->
            <div class="oredoo-popup-text">
              <p class="oredoo-popup-title">إشحن بأي قيمة واحصل على 100% من القيمة المشحونة</p>
              <p class="oredoo-popup-divider">أو</p>
              <p class="oredoo-popup-title">سدد فاتورتك وادخل السحب على iPhone 17 Pro Max</p>
            </div>
            
            <!-- Countdown Timer -->
            <div class="oredoo-popup-timer">
              <div class="timer-label">الوقت المتبقي:</div>
              <div class="timer-display">
                <div class="timer-unit">
                  <span class="timer-value" id="hours">00</span>
                  <span class="timer-label-small">ساعات</span>
                </div>
                <span class="timer-separator">:</span>
                <div class="timer-unit">
                  <span class="timer-value" id="minutes">00</span>
                  <span class="timer-label-small">دقائق</span>
                </div>
                <span class="timer-separator">:</span>
                <div class="timer-unit">
                  <span class="timer-value" id="seconds">00</span>
                  <span class="timer-label-small">ثواني</span>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    `;

    // Inject popup into DOM
    document.body.insertAdjacentHTML('beforeend', popupHTML);
  }

  // Inject CSS styles
  function injectStyles() {
    if (document.getElementById('oredoo-promo-popup-css')) return;

    const styles = `
      #oredoo-promo-overlay {
        position: fixed;
        top: 0;
        left: 0;
        width: 100%;
        height: 100%;
        background: rgba(0, 0, 0, 0.7);
        display: flex;
        justify-content: center;
        align-items: center;
        z-index: 9999;
        animation: oredoo-fade-in 0.3s ease-in-out;
      }

      @keyframes oredoo-fade-in {
        from {
          opacity: 0;
        }
        to {
          opacity: 1;
        }
      }

      .oredoo-promo-popup {
        background: white;
        border-radius: 16px;
        padding: 30px;
        max-width: 500px;
        width: 90%;
        box-shadow: 0 10px 40px rgba(0, 0, 0, 0.3);
        position: relative;
        animation: oredoo-slide-up 0.4s ease-out;
      }

      @keyframes oredoo-slide-up {
        from {
          transform: translateY(30px);
          opacity: 0;
        }
        to {
          transform: translateY(0);
          opacity: 1;
        }
      }

      .oredoo-popup-close {
        position: absolute;
        top: 15px;
        right: 15px;
        background: none;
        border: none;
        font-size: 28px;
        color: #999;
        cursor: pointer;
        padding: 0;
        width: 30px;
        height: 30px;
        display: flex;
        align-items: center;
        justify-content: center;
        transition: color 0.2s;
      }

      .oredoo-popup-close:hover {
        color: #E31937;
      }

      .oredoo-popup-content {
        text-align: center;
      }

      .oredoo-popup-logo {
        margin-bottom: 20px;
      }

      .oredoo-popup-logo svg {
        max-width: 150px;
        height: auto;
      }

      .oredoo-popup-text {
        margin-bottom: 25px;
      }

      .oredoo-popup-title {
        font-size: 16px;
        font-weight: 600;
        color: #333;
        line-height: 1.6;
        margin: 10px 0;
        font-family: 'Tahoma', 'Arial', 'Noto Kufi Arabic', sans-serif;
      }

      .oredoo-popup-divider {
        font-size: 14px;
        color: #999;
        margin: 15px 0;
      }

      .oredoo-popup-timer {
        background: #f5f5f5;
        border-radius: 12px;
        padding: 20px;
        margin-top: 20px;
      }

      .timer-label {
        font-size: 14px;
        color: #666;
        margin-bottom: 12px;
        font-weight: 500;
        font-family: 'Tahoma', 'Arial', 'Noto Kufi Arabic', sans-serif;
      }

      .timer-display {
        display: flex;
        justify-content: center;
        align-items: center;
        gap: 8px;
      }

      .timer-unit {
        display: flex;
        flex-direction: column;
        align-items: center;
      }

      .timer-value {
        font-size: 32px;
        font-weight: bold;
        color: #E31937;
        line-height: 1;
        min-width: 50px;
      }

      .timer-label-small {
        font-size: 11px;
        color: #999;
        margin-top: 4px;
        font-family: 'Tahoma', 'Arial', 'Noto Kufi Arabic', sans-serif;
      }

      .timer-separator {
        font-size: 28px;
        color: #E31937;
        font-weight: bold;
        margin: 0 4px;
      }

      @media (max-width: 600px) {
        .oredoo-promo-popup {
          padding: 20px;
        }

        .oredoo-popup-title {
          font-size: 14px;
        }

        .timer-value {
          font-size: 24px;
          min-width: 40px;
        }

        .timer-separator {
          font-size: 20px;
        }
      }
    `;

    const styleElement = document.createElement('style');
    styleElement.id = 'oredoo-promo-popup-css';
    styleElement.textContent = styles;
    document.head.appendChild(styleElement);
  }

  // Start countdown timer
  function startCountdown(initialSeconds) {
    let remainingSeconds = initialSeconds;

    function updateTimer() {
      const time = formatTime(remainingSeconds);
      document.getElementById('hours').textContent = time.hours;
      document.getElementById('minutes').textContent = time.minutes;
      document.getElementById('seconds').textContent = time.seconds;

      if (remainingSeconds > 0) {
        remainingSeconds--;
        setTimeout(updateTimer, 1000);
      }
    }

    updateTimer();
  }

  // Close popup handler
  function setupCloseButton() {
    const closeBtn = document.querySelector('.oredoo-popup-close');
    const overlay = document.getElementById('oredoo-promo-overlay');

    if (closeBtn) {
      closeBtn.addEventListener('click', function() {
        overlay.style.animation = 'oredoo-fade-out 0.3s ease-in-out';
        setTimeout(function() {
          overlay.remove();
        }, 300);
      });
    }

    // Close on overlay click (outside popup)
    overlay.addEventListener('click', function(e) {
      if (e.target === overlay) {
        overlay.style.animation = 'oredoo-fade-out 0.3s ease-in-out';
        setTimeout(function() {
          overlay.remove();
        }, 300);
      }
    });
  }

  // Initialize popup
  function initPopup() {
    // Inject styles first
    injectStyles();

    // Create popup
    createPopup();

    // Setup close button
    setupCloseButton();

    // Start countdown with random time
    const countdownSeconds = getRandomCountdownSeconds();
    startCountdown(countdownSeconds);
  }

  // Wait for DOM to be ready and show popup after 2 seconds
  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', function() {
      console.log("Promo popup initialized"); setTimeout(initPopup, 2000);
    });
  } else {
    console.log("Promo popup initialized"); setTimeout(initPopup, 2000);
  }
})();
