requirejs.config({
  baseUrl: '.', 
  paths: {
    jquery: 'https://cdnjs.cloudflare.com/ajax/libs/jquery/3.7.1/jquery.min',
    moment: 'https://cdnjs.cloudflare.com/ajax/libs/moment.js/2.29.4/moment.min',
    storage: 'assets/scripts/storage',
    uiHelper: 'assets/scripts/uiHelper',
    taskManager: 'assets/scripts/taskManager',
    dropdownManager: 'assets/scripts/dropdownManager',
    formManager: 'assets/scripts/formManager'
  },
  shim: {
    jquery: {
      exports: '$'
    },
    moment: {
      exports: 'moment'
    }
  }
});

require(['jquery', 'moment', 'storage', 'uiHelper', 'taskManager', 'dropdownManager', 'formManager'], 
function($, moment, Storage, UIHelpers, TaskManager, DropdownManager, FormManager) {
  'use strict';
  
  let isDropdownVisible = false;
  let isCompletedVisible = false;
  let isProfileDropdownVisible = false;

  function initializeApp() {
    TaskManager.clearAllExistingContent();
    TaskManager.initializeCounters();
    
    $('#taskDateInput').val(moment().format('YYYY-MM-DD'));
    
    TaskManager.loadTasksFromStorage();
    TaskManager.loadCompletedTasksFromStorage();
  }

  function toggleProfileDropdown() {
    const $profileDropdown = $('#profileDropdown');
    const $dropdownArrow = $('#dropdownArrow');
    
    isProfileDropdownVisible = UIHelpers.toggle($profileDropdown, isProfileDropdownVisible);
    $dropdownArrow.toggleClass("arrow-rotated", isProfileDropdownVisible);
  }

  function closeProfileDropdown() {
    if (isProfileDropdownVisible) {
      const $profileDropdown = $('#profileDropdown');
      const $dropdownArrow = $('#dropdownArrow');
      
      UIHelpers.hide($profileDropdown);
      $dropdownArrow.removeClass("arrow-rotated");
      isProfileDropdownVisible = false;
    }
  }

  function toggleSortDropdown() {
    const $sortDropdownMenu = $('#sortDropdownMenu');
    const $sortArrow = $('#sortArrow');
    
    isDropdownVisible = UIHelpers.toggle($sortDropdownMenu, isDropdownVisible);
    $sortArrow.toggleClass("arrow-rotated", isDropdownVisible);
  }

  function hideSortDropdown() {
    if (isDropdownVisible) {
      const $sortDropdownMenu = $('#sortDropdownMenu');
      const $sortArrow = $('#sortArrow');
      
      UIHelpers.hide($sortDropdownMenu);
      $sortArrow.removeClass("arrow-rotated");
      isDropdownVisible = false;
    }
  }

  function toggleCompletedSection() {
    const $completedTasks = $('#completedTasks');
    const $completedArrow = $('#completedArrow');
    
    isCompletedVisible = UIHelpers.toggle($completedTasks, isCompletedVisible);
    
    if (isCompletedVisible) {
      $completedArrow.html('<img src="/assets/images/icons/Arrow - Down 2.svg" alt="Arrow down">');
    } else {
      $completedArrow.html('<img src="/assets/images/icons/Arrow - Right 2.svg" alt="Arrow right">');
    }
  }

  function setupEventListeners() {
    $('#addTaskBtn').on('click', function() {
      if (FormManager.isFormVisible()) {
        FormManager.hideTaskForm();
      } else {
        FormManager.showTaskForm();
      }
    });

    $('#completedToggle').on('click', toggleCompletedSection);

    $('#sortDropdown').on('click', function(e) {
      e.preventDefault();
      toggleSortDropdown();
    });

    $('#taskNameInput').on('keypress', function(e) {
      if (e.which === 13) { 
        const taskName = $(this).val().trim();
        const description = $('#taskDescriptionInput').val().trim();
        const date = $('#taskDateInput').val();
        
        if (taskName) {
          TaskManager.createTask(taskName, description, date);
          FormManager.hideTaskForm();
        }
      }
    });

    $('#taskDescriptionInput').on('keypress', function(e) {
      if (e.which === 13) { 
        const taskName = $('#taskNameInput').val().trim();
        const description = $(this).val().trim();
        const date = $('#taskDateInput').val();
        
        if (taskName) {
          TaskManager.createTask(taskName, description, date);
          FormManager.hideTaskForm();
        }
      }
    });

    $('#taskDateInput').on('keypress', function(e) {
      if (e.which === 13) { 
        const taskName = $('#taskNameInput').val().trim();
        const description = $('#taskDescriptionInput').val().trim();
        const date = $(this).val();
        
        if (taskName) {
          TaskManager.createTask(taskName, description, date);
          FormManager.hideTaskForm();
        }
      }
    });

    $('#descriptionToggle').on('click', function() {
      const $label = $('#descriptionLabel');
      const $input = $('#taskDescriptionInput');
      
      if ($label.is(':visible')) {
        $label.hide();
        $input.removeClass('hidden').addClass('flex-1');
        $input.focus();
      }
    });

    $('#dateTimeToggle').on('click', function() {
      const $label = $('#dateTimeLabel');
      const $input = $('#taskDateInput');
      
      if ($label.is(':visible')) {
        $label.hide();
        $input.removeClass('hidden');
        $input.focus();
      }
    });

    $('input[name="sortOption"]').on('change', function() {
      const selectedLabel = $(this).next('label').text();
      $('#sortDropdown').text(selectedLabel);
      hideSortDropdown();
    });

    $(document).on('click', '[data-task-dropdown]', function(e) {
      e.preventDefault();
      e.stopPropagation();
      const taskId = $(this).attr("data-task-dropdown");
      if (taskId) {
        DropdownManager.toggleTaskDropdown(taskId);
      }
    });

    $(document).on('click', '.task-dropdown-option', function(e) {
      e.preventDefault();
      e.stopPropagation();
      const $option = $(this);
      const action = $option.attr("data-action");
      const taskId = $option.attr("data-task-id");
      
      console.log('Task dropdown option clicked:', action, taskId); 
      
      if (action === "rename" && taskId) {
        TaskManager.renameTask(taskId);
      } else if (action === "delete" && taskId) {
        TaskManager.deleteTask(taskId);
      }
      DropdownManager.closeAllTaskDropdowns();
    });

    $(document).on('click', '[data-completed-task-id]', function(e) {
      e.preventDefault();
      e.stopPropagation();
      const taskId = $(this).attr("data-completed-task-id");
      if (taskId) {
        DropdownManager.toggleCompletedTaskDropdown(taskId);
      }
    });

    $(document).on('click', '.completed-task-option', function(e) {
      e.preventDefault();
      e.stopPropagation();
      const $option = $(this);
      const action = $option.attr("data-action");
      const taskId = $option.attr("data-task-id");
      
      console.log('Completed task option clicked:', action, taskId); 
      
      if (action === "restore" && taskId) {
        TaskManager.restoreTask(taskId);
      } else if (action === "delete" && taskId) {
        TaskManager.deleteTaskPermanently(taskId);
      }
      DropdownManager.closeAllCompletedDropdowns();
    });

    $(document).on('click', '[data-task-target]', function(e) {
      e.preventDefault();
      e.stopPropagation();
      const taskId = $(this).attr("data-task-target");
      if (taskId) {
        DropdownManager.toggleSubtaskSection(taskId);
      }
    });

    $(document).on('click', '.add-subtask-btn', function(e) {
      e.preventDefault();
      e.stopPropagation();
      const taskId = $(this).attr("data-task-id");
      if (taskId) {
        TaskManager.addSubtask(taskId);
      }
    });

    $(document).on('click', '.subtask-delete', function(e) {
      e.preventDefault();
      e.stopPropagation();
      const $subtaskItem = $(this).closest(".subtask-item");
      if ($subtaskItem.length) {
        TaskManager.deleteSubtask($subtaskItem);
      }
    });

    $(document).on('click', '#profileContainer', function(e) {
      e.stopPropagation();
      toggleProfileDropdown();
    });

    $(document).on('click', '.profile-dropdown-option', function(e) {
      const $option = $(this);
      const optionText = $option.find("span:last-child").text();
      
      switch(optionText) {
        case "Profile Settings":
          console.log("Navigate to profile settings");
          break;
        case "Account Settings":
          console.log("Navigate to account settings");
          break;
        case "Dark Mode":
          console.log("Toggle dark mode");
          break;
        case "Help & Support":
          console.log("Navigate to help");
          break;
        case "Logout":
          if (confirm("Are you sure you want to logout?")) {
            console.log("User logged out");
          }
          break;
      }
      closeProfileDropdown();
    });

    $(document).on('click', function(e) {
      const $target = $(e.target);
      
      if ($target.closest('.task-dropdown, .completed-task-dropdown, #profileDropdown, #sortDropdownMenu, #taskInputForm').length) {
        return;
      }
      
      if ($target.closest('[data-task-dropdown], [data-completed-task-id], [data-task-target], #sortDropdownContainer, #addTaskBtn').length) {
        return;
      }
      
      closeProfileDropdown();
      DropdownManager.closeAllTaskDropdowns();
      DropdownManager.closeAllCompletedDropdowns();
      hideSortDropdown();
      
      if (FormManager.isFormVisible()) {
        FormManager.hideTaskForm();
      }
    });

    $(document).on('change', '.task-checkbox', function() {
      const $checkbox = $(this);
      const $label = $checkbox.next();
      const $taskItem = $checkbox.closest("[data-task-id]");
      const $taskContent = $taskItem.find(".flex.flex-col.gap-2");
      
      if ($checkbox.is(':checked')) {
        $label.addClass("bg-primary border-primary checked")
              .removeClass("border-gray-300");
        if ($taskContent.length) $taskContent.css('opacity', '0.6');
        
        const taskId = $taskItem.attr('data-task-id');
        const title = $taskItem.find('.task-title').text() || 'Completed Task';
        
        const completedTaskData = {
          id: taskId,
          title: title
        };
        
        TaskManager.createCompletedTaskFromData(completedTaskData);
        
        setTimeout(() => {
          $taskItem.css({
            opacity: '0',
            transform: 'translateX(-20px)'
          });
          
          setTimeout(() => {
            const $subtaskSection = $(`[data-subtask-for="${taskId}"]`);
            $taskItem.remove();
            $subtaskSection.remove();
            TaskManager.saveTasksToStorage();
            TaskManager.saveCompletedTasksToStorage();
            TaskManager.updateCompletedTasksCount();
          }, 300);
        }, 500);
        
      } else {
        $label.removeClass("bg-primary border-primary checked")
              .addClass("border-gray-300");
        if ($taskContent.length) $taskContent.css('opacity', '1');
        TaskManager.saveTasksToStorage();
      }
    });

    $(document).on('change', '.subtask-checkbox', function() {
      const $checkbox = $(this);
      const $label = $checkbox.next();
      const $subtaskItem = $checkbox.closest(".subtask-item");
      const $subtaskText = $subtaskItem.find(".subtask-text");
      
      if ($checkbox.is(':checked')) {
        $label.addClass("bg-primary border-primary checked")
              .removeClass("border-gray-300");
        if ($subtaskText.length) {
          $subtaskText.addClass("line-through text-gray-500 opacity-60")
                     .removeClass("text-gray-900");
        }
      } else {
        $label.removeClass("bg-primary border-primary checked")
              .addClass("border-gray-300");
        if ($subtaskText.length) {
          $subtaskText.removeClass("line-through text-gray-500 opacity-60")
                     .addClass("text-gray-900");
        }
      }
      
      TaskManager.saveTasksToStorage();
    });

    $(document).on('keydown', function(e) {
      if (e.which === 27) { 
        if (FormManager.isFormVisible()) FormManager.hideTaskForm();
        if (isDropdownVisible) hideSortDropdown();
        if (isProfileDropdownVisible) closeProfileDropdown();
        if (DropdownManager.activeTaskDropdowns.size > 0) DropdownManager.closeAllTaskDropdowns();
        if (DropdownManager.activeCompletedDropdowns.size > 0) DropdownManager.closeAllCompletedDropdowns();
      }
    });
  }

  $(document).ready(function() {
    initializeApp();
    setupEventListeners();
  });
});