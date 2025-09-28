define(['jquery'], function($) {
  'use strict';
  
  /**
   * @param {jQuery} $element
   */
  function showElement($element) {
    $element.removeClass("hidden opacity-0 transform -translate-y-2")
            .addClass("dropdown-active");
  }

  /**
   * @param {jQuery} $element 
   */
  function hideElement($element) {
    $element.addClass("hidden opacity-0 transform -translate-y-2")
            .removeClass("dropdown-active");
  }

  /**
   * @param {jQuery} $element
   * @param {boolean} isVisible 
   * @returns {boolean} 
   */
  function toggleElement($element, isVisible) {
    if (isVisible) {
      hideElement($element);
      return false;
    } else {
      showElement($element);
      return true;
    }
  }

  /**
   * @param {jQuery} $element
   * @param {number} duration
   * @param {function} callback
   */
  function fadeIn($element, duration = 300, callback = null) {
    $element.removeClass('hidden')
            .css('opacity', '0')
            .animate({ opacity: 1 }, duration, callback);
  }

  /**
   * @param {jQuery} $element 
   * @param {number} duration 
   * @param {function} callback 
   */
  function fadeOut($element, duration = 300, callback = null) {
    $element.animate({ opacity: 0 }, duration, function() {
      $element.addClass('hidden');
      if (callback) callback();
    });
  }

  /**
   * @param {jQuery} $element 
   * @param {number} duration 
   * @param {function} callback 
   */
  function slideDown($element, duration = 300, callback = null) {
    $element.removeClass('hidden').slideDown(duration, callback);
  }

  /**
   * @param {jQuery} $element
   * @param {number} duration
   * @param {function} callback
   */
  function slideUp($element, duration = 300, callback = null) {
    $element.slideUp(duration, function() {
      $element.addClass('hidden');
      if (callback) callback();
    });
  }

  /**
   * @param {jQuery} $element
   * @param {string} loadingText
   */
  function addLoadingState($element, loadingText = 'Loading...') {
    $element.data('original-text', $element.text())
            .text(loadingText)
            .prop('disabled', true)
            .addClass('opacity-50 cursor-not-allowed');
  }

  /**
   * @param {jQuery} $element
   */
  function removeLoadingState($element) {
    const originalText = $element.data('original-text');
    if (originalText) {
      $element.text(originalText)
              .removeData('original-text');
    }
    $element.prop('disabled', false)
            .removeClass('opacity-50 cursor-not-allowed');
  }

  /**
   * @param {jQuery} $element 
   * @param {number} duration 
   * @param {number} offset 
   */
  function scrollToElement($element, duration = 500, offset = 0) {
    if ($element.length) {
      $('html, body').animate({
        scrollTop: $element.offset().top - offset
      }, duration);
    }
  }

  /**
   * @param {jQuery} $element 
   * @returns {boolean} 
   */
  function isElementInViewport($element) {
    if (!$element.length) return false;
    
    const elementTop = $element.offset().top;
    const elementBottom = elementTop + $element.outerHeight();
    const viewportTop = $(window).scrollTop();
    const viewportBottom = viewportTop + $(window).height();
    
    return elementBottom > viewportTop && elementTop < viewportBottom;
  }

  /**
   * @param {function} func 
   * @param {number} wait
   * @param {boolean} immediate 
   * @returns {function} 
   */
  function debounce(func, wait, immediate = false) {
    let timeout;
    return function executedFunction(...args) {
      const later = () => {
        timeout = null;
        if (!immediate) func.apply(this, args);
      };
      const callNow = immediate && !timeout;
      clearTimeout(timeout);
      timeout = setTimeout(later, wait);
      if (callNow) func.apply(this, args);
    };
  }

  /**
   * @param {function} func 
   * @param {number} limit
   * @returns {function} 
   */
  function throttle(func, limit) {
    let inThrottle;
    return function executedFunction(...args) {
      if (!inThrottle) {
        func.apply(this, args);
        inThrottle = true;
        setTimeout(() => inThrottle = false, limit);
      }
    };
  }

  return {
    show: showElement,
    hide: hideElement,
    toggle: toggleElement,
    fadeIn: fadeIn,
    fadeOut: fadeOut,
    slideDown: slideDown,
    slideUp: slideUp,
    addLoadingState: addLoadingState,
    removeLoadingState: removeLoadingState,
    scrollToElement: scrollToElement,
    isElementInViewport: isElementInViewport,
    debounce: debounce,
    throttle: throttle
  };
});