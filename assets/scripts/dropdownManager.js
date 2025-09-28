define(['jquery', 'uiHelper'], function($, UIHelpers) {
  'use strict';
  
  let activeTaskMenus = new Set();
  let activeCompletedDropdowns = new Set();
  let activeTaskDropdowns = new Set();

  /**
   * @param {string} taskId
   */
  function toggleTaskDropdown(taskId) {
    $('.task-dropdown').each(function() {
      const dropdownTaskId = $(this).attr('data-task-dropdown-menu');
      if (dropdownTaskId !== taskId.toString()) {
        UIHelpers.hide($(this));
        activeTaskDropdowns.delete(dropdownTaskId);
      }
    });

    const $dropdown = $(`[data-task-dropdown-menu="${taskId}"]`);
    if ($dropdown.length) {
      const isActive = $dropdown.hasClass('dropdown-active');
      
      if (isActive) {
        UIHelpers.hide($dropdown);
        activeTaskDropdowns.delete(taskId.toString());
      } else {
        UIHelpers.show($dropdown);
        activeTaskDropdowns.add(taskId.toString());
      }
    }
  }

  /**
   */
  function closeAllTaskDropdowns() {
    $('.task-dropdown').each(function() {
      UIHelpers.hide($(this));
    });
    activeTaskDropdowns.clear();
  }

  /**
   * @param {string} taskId 
   */
  function toggleCompletedTaskDropdown(taskId) {
    $('.completed-task-dropdown').each(function() {
      const dropdownTaskId = $(this).attr('data-dropdown-for');
      if (dropdownTaskId !== taskId.toString()) {
        UIHelpers.hide($(this));
        activeCompletedDropdowns.delete(dropdownTaskId);
      }
    });

    const $dropdown = $(`[data-dropdown-for="${taskId}"]`);
    if ($dropdown.length) {
      const isActive = $dropdown.hasClass('dropdown-active');
      
      if (isActive) {
        UIHelpers.hide($dropdown);
        activeCompletedDropdowns.delete(taskId.toString());
      } else {
        UIHelpers.show($dropdown);
        activeCompletedDropdowns.add(taskId.toString());
      }
    }
  }

  /**
   */
  function closeAllCompletedDropdowns() {
    $('.completed-task-dropdown').each(function() {
      UIHelpers.hide($(this));
    });
    activeCompletedDropdowns.clear();
  }

  /**
   * @param {string} taskId
   */
  function toggleSubtaskSection(taskId) {
    const $subtaskSection = $(`[data-subtask-for="${taskId}"]`);
    const $taskMenu = $(`[data-task-target="${taskId}"]`);

    if ($subtaskSection.length) {
      const isActive = $subtaskSection.hasClass("dropdown-active");

      if (isActive) {
        UIHelpers.hide($subtaskSection);
        $taskMenu.removeClass("menu-expanded");
        activeTaskMenus.delete(taskId);
      } else {
        UIHelpers.show($subtaskSection);
        $taskMenu.addClass("menu-expanded");
        activeTaskMenus.add(taskId);
      }
    }
  }

  /**
   */
  function closeAllSubtaskSections() {
    $('[data-subtask-for]').each(function() {
      UIHelpers.hide($(this));
      const taskId = $(this).attr('data-subtask-for');
      const $taskMenu = $(`[data-task-target="${taskId}"]`);
      $taskMenu.removeClass("menu-expanded");
    });
    activeTaskMenus.clear();
  }

  /**
   */
  function closeAllDropdowns() {
    closeAllTaskDropdowns();
    closeAllCompletedDropdowns();
    closeAllSubtaskSections();
  }

  /**
   * @returns {number}
   */
  function getActiveDropdownCount() {
    return activeTaskDropdowns.size + activeCompletedDropdowns.size + activeTaskMenus.size;
  }

  /**
   * @returns {boolean} 
   */
  function hasActiveDropdowns() {
    return getActiveDropdownCount() > 0;
  }

  /**
   * @param {jQuery} $dropdown
   * @param {jQuery} $trigger 
   */
  function toggleDropdownWithPosition($dropdown, $trigger) {
    if (!$dropdown.length || !$trigger.length) return;

    const isActive = $dropdown.hasClass('dropdown-active');
    
    if (isActive) {
      UIHelpers.hide($dropdown);
    } else {
      const triggerOffset = $trigger.offset();
      const triggerHeight = $trigger.outerHeight();
      const dropdownWidth = $dropdown.outerWidth();
      const windowWidth = $(window).width();
      
      let leftPosition = triggerOffset.left;
      if (leftPosition + dropdownWidth > windowWidth) {
        leftPosition = windowWidth - dropdownWidth - 10; 
      }
      
      $dropdown.css({
        position: 'absolute',
        top: triggerOffset.top + triggerHeight + 5,
        left: Math.max(10, leftPosition),
        zIndex: 1000
      });
      
      UIHelpers.show($dropdown);
    }
  }

  /**
   * @param {Event} event 
   */
  function handleClickOutside(event) {
    const $target = $(event.target);
    
    if ($target.closest('.task-dropdown, .completed-task-dropdown, .subtask-section').length) {
      return;
    }
    
    if ($target.closest('[data-task-dropdown], [data-completed-task-id], [data-task-target]').length) {
      return;
    }
    
    closeAllDropdowns();
  }

  /**
   */
  function initialize() {
    $(document).on('click', handleClickOutside);
    
    $(document).on('keydown', function(e) {
      if (e.which === 27 && hasActiveDropdowns()) { 
      }
    });
  }

  /**
   */
  function destroy() {
    $(document).off('click', handleClickOutside);
    closeAllDropdowns();
    activeTaskMenus.clear();
    activeCompletedDropdowns.clear();
    activeTaskDropdowns.clear();
  }

  return {
    toggleTaskDropdown: toggleTaskDropdown,
    closeAllTaskDropdowns: closeAllTaskDropdowns,
    toggleCompletedTaskDropdown: toggleCompletedTaskDropdown,
    closeAllCompletedDropdowns: closeAllCompletedDropdowns,
    toggleSubtaskSection: toggleSubtaskSection,
    closeAllSubtaskSections: closeAllSubtaskSections,
    closeAllDropdowns: closeAllDropdowns,
    toggleDropdownWithPosition: toggleDropdownWithPosition,
    getActiveDropdownCount: getActiveDropdownCount,
    hasActiveDropdowns: hasActiveDropdowns,
    initialize: initialize,
    destroy: destroy,
    activeTaskMenus: activeTaskMenus,
    activeCompletedDropdowns: activeCompletedDropdowns,
    activeTaskDropdowns: activeTaskDropdowns
  };
});