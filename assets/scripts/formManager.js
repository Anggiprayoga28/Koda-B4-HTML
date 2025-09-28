define(['jquery', 'moment'], function($, moment) {
  'use strict';
  
  let isFormVisible = false;

  /**
   */
  function showTaskForm() {
    if (!isFormVisible) {
      const $form = $('#taskInputForm');
      const $addBtn = $('#addTaskBtn');
      
      $form.removeClass("hidden opacity-0 transform -translate-y-2")
           .addClass("flex fade-in");
      
      $addBtn.html("Tutup Form")
             .removeClass("bg-primary hover:bg-primary-light")
             .addClass("bg-gray-500");
      
      $('#taskNameInput').focus();
      
      if (!$('#taskDateInput').val()) {
        $('#taskDateInput').val(moment().format('YYYY-MM-DD'));
      }
      
      isFormVisible = true;
    }
  }

  /**
   */
  function hideTaskForm() {
    if (isFormVisible) {
      const $form = $('#taskInputForm');
      const $addBtn = $('#addTaskBtn');
      
      $form.addClass("hidden opacity-0 transform -translate-y-2")
           .removeClass("flex fade-in");
      
      $addBtn.html('<span><img src="/assets/images/icons/Plus.svg" alt="Plus"></span><span>Tambah tugas</span>')
             .addClass("bg-primary hover:bg-primary-light")
             .removeClass("bg-gray-500");
      
      clearFormInputs();
      
      resetFormInputsVisibility();
      
      isFormVisible = false;
    }
  }

  /**
   */
  function toggleTaskForm() {
    if (isFormVisible) {
      hideTaskForm();
    } else {
      showTaskForm();
    }
  }

  /**
   */
  function clearFormInputs() {
    $('#taskNameInput').val("");
    $('#taskDescriptionInput').val("");
    $('#taskDateInput').val(moment().format('YYYY-MM-DD'));
  }

  /**
   */
  function resetFormInputsVisibility() {
    const $descriptionLabel = $('#descriptionLabel');
    const $descriptionInput = $('#taskDescriptionInput');
    const $dateLabel = $('#dateTimeLabel');
    const $dateInput = $('#taskDateInput');
    
    $descriptionLabel.show();
    $descriptionInput.addClass('hidden').removeClass('flex-1');
    
    $dateLabel.show();
    $dateInput.addClass('hidden');
  }

  /**
   * @returns {Object} 
   */
  function getFormData() {
    return {
      name: $('#taskNameInput').val().trim(),
      description: $('#taskDescriptionInput').val().trim(),
      date: $('#taskDateInput').val()
    };
  }

  /**
   * @param {Object} data 
   */
  function setFormData(data) {
    if (data.name !== undefined) {
      $('#taskNameInput').val(data.name);
    }
    if (data.description !== undefined) {
      $('#taskDescriptionInput').val(data.description);
    }
    if (data.date !== undefined) {
      $('#taskDateInput').val(data.date);
    }
  }

  /**
   * @returns {Object} 
   */
  function validateForm() {
    const formData = getFormData();
    const errors = [];
    
    if (!formData.name) {
      errors.push('Task name is required');
    }
    
    if (formData.name.length > 100) {
      errors.push('Task name is too long (max 100 characters)');
    }
    
    if (formData.description.length > 500) {
      errors.push('Description is too long (max 500 characters)');
    }
    
    if (formData.date && !moment(formData.date).isValid()) {
      errors.push('Invalid date format');
    }
    
    return {
      isValid: errors.length === 0,
      errors: errors,
      data: formData
    };
  }

  /**
   * @param {Array} errors 
   */
  function showFormErrors(errors) {
    $('.form-error').remove();
    
    errors.forEach(error => {
      const $errorDiv = $('<div class="form-error text-red-500 text-sm mt-1"></div>').text(error);
      $('#taskNameInput').after($errorDiv);
    });
  }

  /**
   */
  function clearFormErrors() {
    $('.form-error').remove();
  }

  /**
   */
  function handleDescriptionToggle() {
    const $label = $('#descriptionLabel');
    const $input = $('#taskDescriptionInput');
    
    if ($label.is(':visible')) {
      $label.hide();
      $input.removeClass('hidden').addClass('flex-1');
      $input.focus();
    }
  }

  /**
   */
  function handleDateTimeToggle() {
    const $label = $('#dateTimeLabel');
    const $input = $('#taskDateInput');
    
    if ($label.is(':visible')) {
      $label.hide();
      $input.removeClass('hidden');
      $input.focus();
    }
  }

  /**
   */
  function setupFormEventListeners() {
    $('#descriptionToggle').on('click', handleDescriptionToggle);
    
    $('#dateTimeToggle').on('click', handleDateTimeToggle);
    
    $('#taskNameInput, #taskDescriptionInput, #taskDateInput').on('input change', function() {
      if (isFormVisible) {
        const formData = getFormData();
        localStorage.setItem('wazwez_temp_form_data', JSON.stringify(formData));
      }
    });
    
    $(document).on('task:created', function() {
      localStorage.removeItem('wazwez_temp_form_data');
      clearFormErrors();
    });
  }

  /**
   */
  function loadTempFormData() {
    try {
      const tempData = localStorage.getItem('wazwez_temp_form_data');
      if (tempData) {
        const formData = JSON.parse(tempData);
        setFormData(formData);
        
        if (formData.description) {
          handleDescriptionToggle();
        }
      }
    } catch (error) {
      console.error('Error loading temporary form data:', error);
    }
  }

  /**
   * @param {jQuery} $textarea 
   */
  function autoResizeTextarea($textarea) {
    $textarea.on('input', function() {
      this.style.height = 'auto';
      this.style.height = (this.scrollHeight) + 'px';
    });
  }

  /**
   */
  function initialize() {
    setupFormEventListeners();
    
    $('#taskDateInput').val(moment().format('YYYY-MM-DD'));
    
    const $descriptionInput = $('#taskDescriptionInput');
    if ($descriptionInput.is('textarea')) {
      autoResizeTextarea($descriptionInput);
    }
    
    loadTempFormData();
  }

  /**
   */
  function destroy() {
    $('#descriptionToggle').off('click', handleDescriptionToggle);
    $('#dateTimeToggle').off('click', handleDateTimeToggle);
    $('#taskNameInput, #taskDescriptionInput, #taskDateInput').off('input change');
    
    localStorage.removeItem('wazwez_temp_form_data');
    clearFormErrors();
  }

  /**
   * @param {string} inputName 
   */
  function focusInput(inputName = 'name') {
    const inputs = {
      name: '#taskNameInput',
      description: '#taskDescriptionInput',
      date: '#taskDateInput'
    };
    
    const inputSelector = inputs[inputName];
    if (inputSelector) {
      $(inputSelector).focus();
    }
  }

  return {
    showTaskForm: showTaskForm,
    hideTaskForm: hideTaskForm,
    toggleTaskForm: toggleTaskForm,
    clearFormInputs: clearFormInputs,
    resetFormInputsVisibility: resetFormInputsVisibility,
    getFormData: getFormData,
    setFormData: setFormData,
    validateForm: validateForm,
    showFormErrors: showFormErrors,
    clearFormErrors: clearFormErrors,
    handleDescriptionToggle: handleDescriptionToggle,
    handleDateTimeToggle: handleDateTimeToggle,
    loadTempFormData: loadTempFormData,
    focusInput: focusInput,
    initialize: initialize,
    destroy: destroy,
    isFormVisible: function() { return isFormVisible; }
  };
});