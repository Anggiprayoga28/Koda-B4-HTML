define(['jquery'], function($) {
  'use strict';

  /**
   * @param {jQuery} $element 
   */
  function showDropdown($element) {
    $element.removeClass('hidden opacity-0 transform -translate-y-2')
            .addClass('block opacity-100 transform translate-y-0');
  }

  /**
   * @param {jQuery} $element
   */
  function hideDropdown($element) {
    $element.removeClass('block opacity-100 transform translate-y-0')
            .addClass('hidden opacity-0 transform -translate-y-2');
  }

  /**
   * @param {jQuery} $element
   * @returns {boolean}
   */
  function toggleDropdown($element) {
    const isVisible = $element.hasClass('block') && $element.hasClass('opacity-100');
    
    if (isVisible) {
      hideDropdown($element);
      return false;
    } else {
      showDropdown($element);
      return true;
    }
  }

  /**
   * @param {jQuery} $element
   * @param {boolean} isRotated 
   */
  function rotateArrow($element, isRotated) {
    if (isRotated) {
      $element.addClass('transform rotate-180');
    } else {
      $element.removeClass('transform rotate-180');
    }
  }

  /**
   * @param {jQuery} $element
   * @returns {boolean} 
   */
  function toggleArrowRotation($element) {
    const isRotated = $element.hasClass('rotate-180');
    rotateArrow($element, !isRotated);
    return !isRotated;
  }

  /**
   * @param {jQuery} $element 
   * @param {boolean} isExpanded 
   */
  function expandMenu($element, isExpanded) {
    if (isExpanded) {
      $element.addClass('transform rotate-180');
    } else {
      $element.removeClass('transform rotate-180');
    }
  }

  /**
   * @param {jQuery} $element 
   * @returns {boolean} 
   */
  function toggleMenuExpansion($element) {
    const isExpanded = $element.hasClass('rotate-180');
    expandMenu($element, !isExpanded);
    return !isExpanded;
  }

  /**
   * @param {jQuery} $element
   */
  function fadeInElement($element) {
    $element.removeClass('opacity-0 transform -translate-y-2')
            .addClass('opacity-100 transform translate-y-0');
  }

  /**
   * @param {jQuery} $element
   */
  function applyFadeIn($element) {
    fadeInElement($element);
  }

  /**
   * @param {string} name 
   * @param {string} checkedValue 
   */
  function setupRadioGroup(name, checkedValue = null) {
    const $radios = $(`input[name="${name}"]`);
    
    $radios.each(function() {
      const $radio = $(this);
      const isChecked = checkedValue ? $radio.val() === checkedValue : $radio.is(':checked');
      updateRadioState($radio, isChecked);
    });

    $radios.on('change', function() {
      const $changedRadio = $(this);
      const groupName = $changedRadio.attr('name');
      
      $(`input[name="${groupName}"]`).each(function() {
        const $radio = $(this);
        const isChecked = $radio.is(':checked');
        updateRadioState($radio, isChecked);
      });
    });
  }

  /**
   * @param {jQuery} $radio 
   * @param {boolean} isChecked 
   */
  function updateRadioState($radio, isChecked) {
    if (isChecked) {
      $radio.removeClass('border-gray-300')
            .addClass('border-orange-500 bg-gray-50 relative');
      
      if (!$radio.next('.radio-dot').length) {
        $radio.after('<span class="radio-dot absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 w-2 h-2 bg-orange-500 rounded-full pointer-events-none"></span>');
      }
    } else {
      $radio.removeClass('border-orange-500 bg-gray-50')
            .addClass('border-gray-300');
      
      $radio.next('.radio-dot').remove();
    }
  }

  /**
   * @param {string} name 
   * @param {string} id 
   * @param {string} value 
   * @param {string} label 
   * @param {boolean} checked
   * @returns {string}
   */
  function createRadioButton(name, id, value, label, checked = false) {
    const checkedClasses = checked 
      ? 'border-orange-500 bg-gray-50' 
      : 'border-gray-300';
    
    const dotHtml = checked 
      ? '<span class="radio-dot absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 w-2 h-2 bg-orange-500 rounded-full pointer-events-none"></span>'
      : '';

    return `
      <div class="p-3 rounded-lg cursor-pointer transition-colors flex flex-row-reverse items-center gap-3 hover:bg-gray-50">
        <div class="relative">
          <input type="radio" name="${name}" id="${id}" value="${value}" ${checked ? 'checked' : ''} class="w-4 h-4 border ${checkedClasses} rounded-full appearance-none cursor-pointer relative transition-all m-0">
          ${dotHtml}
        </div>
        <label for="${id}" class="text-gray-900 text-sm font-normal cursor-pointer flex-1">${label}</label>
      </div>
    `;
  }

  /**
   */
  function initialize() {
    setupRadioGroup('sortOption', 'sort-tanggal');
    
    $(document).on('click', '.hover\\:bg-gray-50', function(e) {
      const $container = $(this);
      const $radio = $container.find('input[type="radio"]');
      
      if ($radio.length && !$(e.target).is('input, label')) {
        $radio.prop('checked', true).trigger('change');
      }
    });
  }

  /**
   */
  function destroy() {
    $('input[type="radio"]').off('change');
    $(document).off('click', '.hover\\:bg-gray-50');
    $('.radio-dot').remove();
  }

  return {
    showDropdown: showDropdown,
    hideDropdown: hideDropdown,
    toggleDropdown: toggleDropdown,
    rotateArrow: rotateArrow,
    toggleArrowRotation: toggleArrowRotation,
    expandMenu: expandMenu,
    toggleMenuExpansion: toggleMenuExpansion,
    fadeInElement: fadeInElement,
    applyFadeIn: applyFadeIn,
    setupRadioGroup: setupRadioGroup,
    updateRadioState: updateRadioState,
    createRadioButton: createRadioButton,
    initialize: initialize,
    destroy: destroy
  };
});