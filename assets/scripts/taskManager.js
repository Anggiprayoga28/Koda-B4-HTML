define(['jquery', 'moment', 'storage', 'uiHelper'], 
function($, moment, Storage, UIHelpers) {
  'use strict';
  
  let taskIdCounter = 1;
  let subtaskCounter = 1;

  /**
   * @param {string} dateString
   * @returns {string} 
   */
  function formatDateForDisplay(dateString) {
    if (!dateString) return 'Hari ini';
    
    const inputDate = moment(dateString);
    const today = moment();
    const tomorrow = moment().add(1, 'day');
    
    if (inputDate.isSame(today, 'day')) {
      return 'Hari ini';
    } else if (inputDate.isSame(tomorrow, 'day')) {
      return 'Besok';
    } else {
      return inputDate.format('DD MMM YYYY');
    }
  }

  /**
   */
  function initializeCounters() {
    const savedTaskCounter = Storage.load(Storage.STORAGE_KEYS.TASK_COUNTER);
    const savedSubtaskCounter = Storage.load(Storage.STORAGE_KEYS.SUBTASK_COUNTER);
    
    if (savedTaskCounter !== null) {
      taskIdCounter = savedTaskCounter;
    }
    if (savedSubtaskCounter !== null) {
      subtaskCounter = savedSubtaskCounter;
    }
  }

  /**
   */
  function saveCounters() {
    Storage.save(Storage.STORAGE_KEYS.TASK_COUNTER, taskIdCounter);
    Storage.save(Storage.STORAGE_KEYS.SUBTASK_COUNTER, subtaskCounter);
  }

  /**
   */
  function saveTasksToStorage() {
    const tasks = [];
    $('[data-task-id]').each(function() {
      const $taskElement = $(this);
      const taskId = $taskElement.attr('data-task-id');
      const title = $taskElement.find('.task-title').text().trim();
      
      if (!title) return;
      
      const description = $taskElement.find('.task-description').text().trim();
      const $dateElement = $taskElement.find('.task-date');
      const rawDate = $dateElement.attr('data-raw-date');
      const date = $dateElement.text().trim();
      const completed = $taskElement.find('.task-checkbox').is(':checked');
      
      const subtasks = [];
      $(`[data-subtask-for="${taskId}"] .subtask-item`).each(function() {
        const $subtaskItem = $(this);
        const $checkbox = $subtaskItem.find('.subtask-checkbox');
        const $text = $subtaskItem.find('.subtask-text');
        
        if ($text.length && $text.text().trim()) {
          subtasks.push({
            id: $checkbox.attr('id'),
            text: $text.text().trim(),
            completed: $checkbox.is(':checked')
          });
        }
      });
      
      tasks.push({
        id: taskId,
        title: title,
        description: description,
        date: date,
        rawDate: rawDate,
        completed: completed,
        subtasks: subtasks
      });
    });
    
    Storage.save(Storage.STORAGE_KEYS.TASKS, tasks);
  }

  /**
   */
  function saveCompletedTasksToStorage() {
    const completedTasks = [];
    $('[data-completed-task-id]').each(function() {
      const $taskElement = $(this);
      const taskId = $taskElement.attr('data-completed-task-id');
      const title = $taskElement.find('.completed-task-title').text();
      
      completedTasks.push({
        id: taskId,
        title: title
      });
    });
    
    Storage.save(Storage.STORAGE_KEYS.COMPLETED_TASKS, completedTasks);
  }

  /**
   * @param {Object} taskData 
   */
  function createTaskFromData(taskData) {
    if (!taskData || !taskData.title || taskData.title.trim() === '') {
      return;
    }
    
    const taskId = taskData.id;
    const displayDate = formatDateForDisplay(taskData.rawDate || taskData.date);
    
    const newTaskHTML = `
      <article class="task-item" data-task-id="${taskId}" style="display: grid; grid-template-columns: auto 1fr auto; gap: 1rem; align-items: start; padding: 0; transition: transform 0.3s;">
        <div class="task-checkbox-wrapper" style="margin-top: 0.25rem;">
          <input type="checkbox" id="task-${taskId}" class="task-checkbox opacity-0 absolute cursor-pointer" ${taskData.completed ? 'checked' : ''}>
          <label for="task-${taskId}" class="checkbox-custom w-5 h-5 border-2 ${taskData.completed ? 'bg-primary border-primary checked' : 'border-gray-300'} rounded-full flex items-center justify-center cursor-pointer transition-all hover:border-primary"></label>
        </div>
        
        <div class="task-content" style="display: grid; gap: 0.5rem; flex: 1; min-width: 0; opacity: ${taskData.completed ? '0.6' : '1'};">
          <div class="task-header" style="display: grid; grid-template-columns: 1fr auto auto; gap: 0.75rem; align-items: center; position: relative;">
            <h3 class="task-title text-lg text-gray-800 transition-all text-base md:text-lg">${taskData.title.trim()}</h3>
            <time class="task-date bg-primary text-white px-3 py-1 rounded-2xl text-xs font-medium whitespace-nowrap" datetime="${taskData.rawDate || ''}" data-raw-date="${taskData.rawDate || ''}">${displayDate}</time>
            <button class="task-three-dots text-gray-500 cursor-pointer w-5 h-5 flex items-center justify-center text-base transition-all rounded-full font-bold hover:text-primary hover:bg-primary/10" data-task-dropdown="${taskId}" aria-label="Task options">
              <img src="/assets/images/icons/more-vertical.svg" alt="">
            </button>
            
            <nav class="task-dropdown absolute top-full right-0 bg-white border border-gray-300 rounded-lg p-2 min-w-[200px] z-50 shadow-lg opacity-0 transform -translate-y-2 transition-all duration-300 mt-1 hidden" data-task-dropdown-menu="${taskId}">
              <button class="task-dropdown-option rename flex items-center gap-3 px-4 py-3 rounded-lg cursor-pointer transition-colors text-sm text-gray-900 hover:bg-gray-50 w-full text-left" data-action="rename" data-task-id="${taskId}">
                <span class="text-base w-5 h-5 flex items-center justify-center">
                  <img src="/assets/images/icons/Edit.svg" alt="">
                </span>
                <span>Rename task</span>
              </button>
              <button class="task-dropdown-option delete flex items-center gap-3 px-4 py-3 rounded-lg cursor-pointer transition-colors text-sm text-gray-900 hover:bg-gray-50 w-full text-left" data-action="delete" data-task-id="${taskId}">
                <span class="text-base w-5 h-5 flex items-center justify-center">
                  <img src="/assets/images/icons/Delete.svg" alt="">
                </span>
                <span>Delete task</span>
              </button>
            </nav>
          </div>
          ${taskData.description && taskData.description.trim() ? `<p class="task-description text-gray-500 text-sm mt-1 transition-all">${taskData.description.trim()}</p>` : ''}
        </div>
        
        <button class="task-menu text-gray-500 cursor-pointer w-6 h-6 flex items-center justify-center transition-transform duration-300 hover:text-primary" data-task-target="${taskId}" aria-label="Toggle subtasks" style="margin-top: 0.25rem;">
          <img src="/assets/images/icons/Arrow - Down 2.svg" alt="">
        </button>
      </article>
    `;

    const subtaskHTML = `
      <section class="subtask-section bg-gray-50 p-5 rounded-lg mt-4 ml-9 opacity-0 transform -translate-y-2 transition-all duration-300 hidden" data-subtask-for="${taskId}">
        <div style="display: grid; grid-template-columns: 1fr auto; gap: 1rem; align-items: center; margin-bottom: 1rem;">
          <h4 class="text-sm text-gray-900 font-medium">Subtask</h4>
          <button class="add-subtask-btn bg-white text-primary border border-gray-500 px-3 py-1.5 rounded-2xl text-xs font-medium cursor-pointer flex items-center gap-1 transition-all hover:bg-primary hover:text-white hover:border-primary" data-task-id="${taskId}">
            <span><img src="/assets/images/icons/Plus-orange.svg" alt=""></span>
            <span>Tambah</span>
          </button>
        </div>
        <div class="subtasks-list" style="display: grid; gap: 0.5rem;"></div>
      </section>
    `;

    const $tasksContainer = $('#tasksContainer');
    const $taskInputForm = $('#taskInputForm');
    
    if ($taskInputForm.length) {
      $taskInputForm.after(newTaskHTML + subtaskHTML);
    } else {
      $tasksContainer.append(newTaskHTML + subtaskHTML);
    }

    if (taskData.subtasks && taskData.subtasks.length > 0) {
      const $subtasksList = $(`[data-subtask-for="${taskId}"] .subtasks-list`);
      
      taskData.subtasks.forEach(function(subtask) {
        if (!subtask.text || subtask.text.trim() === '') return;
        
        const subtaskItemHTML = `
          <div class="subtask-item" style="display: grid; grid-template-columns: auto 1fr auto; gap: 0.75rem; align-items: center; padding: 0.25rem 0;">
            <div class="subtask-checkbox-wrapper">
              <input type="checkbox" id="${subtask.id || `subtask-${taskId}-${Date.now()}`}" class="subtask-checkbox opacity-0 absolute cursor-pointer" ${subtask.completed ? 'checked' : ''}>
              <label for="${subtask.id || `subtask-${taskId}-${Date.now()}`}" class="subtask-checkbox-custom w-4 h-4 border-2 ${subtask.completed ? 'bg-primary border-primary checked' : 'border-gray-300'} rounded-full flex items-center justify-center cursor-pointer transition-all hover:border-primary"></label>
            </div>
            <span class="subtask-text text-sm ${subtask.completed ? 'text-gray-500 line-through opacity-60' : 'text-gray-900'} flex-1 transition-all">${subtask.text.trim()}</span>
            <button class="subtask-delete text-gray-500 cursor-pointer p-1 rounded transition-all opacity-70 w-7 h-7 flex items-center justify-center text-xs hover:text-primary hover:opacity-100 hover:bg-primary/10" aria-label="Delete subtask">
              <img src="/assets/images/icons/trash.svg" alt="">
            </button>
          </div>
        `;
        
        $subtasksList.append(subtaskItemHTML);
      });
    }
  }

  /**
   * @param {Object} taskData 
   */
  function createCompletedTaskFromData(taskData) {
    const completedTaskHTML = `
      <article class="completed-task-item" data-completed-task-id="${taskData.id}" style="display: grid; grid-template-columns: auto 1fr auto; gap: 1rem; align-items: center; padding: 0.75rem 0; position: relative;">
        <div class="w-5 h-5 bg-primary border-2 border-primary rounded-full flex items-center justify-center completed-task-checkbox"></div>
        <p class="completed-task-title flex-1 text-gray-500 text-base line-through opacity-70 text-sm md:text-base">${taskData.title}</p>
        <button class="completed-task-menu text-gray-500 cursor-pointer w-6 h-6 flex items-center justify-center transition-all rounded-full hover:text-primary hover:bg-primary/10" data-completed-task-id="${taskData.id}" aria-label="Completed task options">
          <img src="/assets/images/icons/Arrow - Down 2.svg" alt="">
        </button>
        <nav class="completed-task-dropdown absolute right-0 top-full bg-white border border-gray-300 rounded-lg p-2 min-w-[180px] md:min-w-[200px] z-50 shadow-lg opacity-0 transform -translate-y-2 transition-all duration-300 hidden" data-dropdown-for="${taskData.id}">
          <button class="completed-task-option restore flex items-center gap-3 px-4 py-3 rounded-lg cursor-pointer transition-colors text-sm text-gray-900 hover:bg-gray-50 w-full text-left" data-action="restore" data-task-id="${taskData.id}">
            <span class="text-base w-5 h-5 flex items-center justify-center"></span>
            <span>Restore to active</span>
          </button>
          <button class="completed-task-option delete flex items-center gap-3 px-4 py-3 rounded-lg cursor-pointer transition-colors text-sm text-gray-900 hover:bg-gray-50 w-full text-left" data-action="delete" data-task-id="${taskData.id}">
            <span class="text-base w-5 h-5 flex items-center justify-center"></span>
            <span>Delete permanently</span>
          </button>
        </nav>
      </article>
    `;
    
    $('#completedTasks').append(completedTaskHTML);
  }

  /**
   */
  function updateCompletedTasksCount() {
    const count = $('[data-completed-task-id]').length;
    $('#completedCount').text(`(${count} tugas)`);
  }

  /**
   */
  function loadTasksFromStorage() {
    const tasks = Storage.load(Storage.STORAGE_KEYS.TASKS, []);
    
    $('[data-task-id]').remove();
    $('[data-subtask-for]').remove();
    
    if (tasks.length > 0) {
      const validTasks = tasks.filter(task => task && task.title && task.title.trim() !== '');
      validTasks.forEach(task => {
        createTaskFromData(task);
      });
      
      if (validTasks.length !== tasks.length) {
        Storage.save(Storage.STORAGE_KEYS.TASKS, validTasks);
      }
    }
  }

  /**
   */
  function loadCompletedTasksFromStorage() {
    const completedTasksData = Storage.load(Storage.STORAGE_KEYS.COMPLETED_TASKS, []);
    $('#completedTasks').empty();
    
    if (completedTasksData.length > 0) {
      completedTasksData.forEach(task => {
        createCompletedTaskFromData(task);
      });
    }
    
    updateCompletedTasksCount();
  }

  /**
   * @param {string} taskName 
   * @param {string} description
   * @param {string} date
   */
  function createTask(taskName, description = '', date = '') {
    if (!taskName.trim()) return;

    const taskId = taskIdCounter++;
    const rawDate = date || moment().format('YYYY-MM-DD');
    
    const taskData = {
      id: taskId,
      title: taskName.trim(),
      description: description.trim(),
      date: formatDateForDisplay(rawDate),
      rawDate: rawDate,
      completed: false,
      subtasks: []
    };

    createTaskFromData(taskData);
    saveTasksToStorage();
    saveCounters();
    
    const $newTaskItem = $(`[data-task-id="${taskId}"]`);
    if ($newTaskItem.length) {
      $newTaskItem.css({
        opacity: '0',
        transform: 'translateY(-10px)',
        transition: 'all 0.3s ease'
      }).animate({
        opacity: 1
      }, 300).css('transform', 'translateY(0)');
    }
  }

  /**
   * @param {string} taskId 
   */
  function renameTask(taskId) {
    const $taskTitleElement = $(`[data-task-id="${taskId}"] .task-title`);
    if ($taskTitleElement.length) {
      const currentTitle = $taskTitleElement.text();
      const newTitle = prompt('Rename task:', currentTitle);
      
      if (newTitle && newTitle.trim() && newTitle.trim() !== currentTitle) {
        $taskTitleElement.text(newTitle.trim());
        saveTasksToStorage();
      }
    }
  }

  /**
   * @param {string} taskId 
   */
  function deleteTask(taskId) {
    if (confirm('Apakah Anda yakin ingin menghapus tugas ini?')) {
      const $taskItem = $(`[data-task-id="${taskId}"]`);
      const $subtaskSection = $(`[data-subtask-for="${taskId}"]`);
      
      if ($taskItem.length) {
        $taskItem.css({
          opacity: '0',
          transform: 'translateX(-20px)'
        });
        
        setTimeout(() => {
          $taskItem.remove();
          $subtaskSection.remove();
          saveTasksToStorage();
        }, 300);
      }
    }
  }

  /**
   * @param {string} taskId 
   */
  function restoreTask(taskId) {
    const $completedTaskItem = $(`[data-completed-task-id="${taskId}"]`);
    if ($completedTaskItem.length) {
      const title = $completedTaskItem.find('.completed-task-title').text() || 'Restored Task';
      
      $completedTaskItem.css({
        opacity: '0',
        transform: 'translateX(-20px)'
      });
      
      setTimeout(() => {
        $completedTaskItem.remove();
        
        const taskData = {
          id: taskId,
          title: title,
          description: '',
          date: 'Hari ini',
          completed: false,
          subtasks: []
        };
        
        createTaskFromData(taskData);
        saveTasksToStorage();
        saveCompletedTasksToStorage();
        updateCompletedTasksCount();
      }, 300);
    }
  }

  /**
   * @param {string} taskId 
   */
  function deleteTaskPermanently(taskId) {
    if (confirm('Apakah Anda yakin ingin menghapus tugas ini secara permanen?')) {
      const $completedTaskItem = $(`[data-completed-task-id="${taskId}"]`);
      if ($completedTaskItem.length) {
        $completedTaskItem.css({
          opacity: '0',
          transform: 'translateX(-20px)'
        });
        
        setTimeout(() => {
          $completedTaskItem.remove();
          saveCompletedTasksToStorage();
          updateCompletedTasksCount();
        }, 300);
      }
    }
  }

  /**
   * @param {string} taskId 
   */
  function addSubtask(taskId) {
    const $subtaskSection = $(`[data-subtask-for="${taskId}"]`);
    if (!$subtaskSection.length) return;

    const $subtasksList = $subtaskSection.find(".subtasks-list");
    const newSubtaskId = `subtask-${taskId}-${subtaskCounter++}`;

    const subtaskFormHTML = `
      <form class="subtask-form" style="display: grid; grid-template-columns: auto 1fr auto; gap: 0.75rem; align-items: center; padding: 0.25rem 0;">
        <div class="subtask-checkbox-wrapper">
          <input type="checkbox" id="${newSubtaskId}" class="subtask-checkbox opacity-0 absolute cursor-pointer" disabled>
          <label for="${newSubtaskId}" class="subtask-checkbox-custom w-4 h-4 border-2 border-gray-300 rounded-full flex items-center justify-center cursor-not-allowed transition-all" style="opacity: 0.5;"></label>
        </div>
        <input type="text" class="subtask-input flex-1 border-none bg-transparent text-sm text-gray-900 outline-none px-1 py-0.5 border-b border-gray-300 placeholder-gray-500" placeholder="Masukkan subtask..." required />
        <button type="button" class="subtask-delete text-gray-500 cursor-pointer p-1 rounded transition-all opacity-70 w-7 h-7 flex items-center justify-center text-xs hover:text-primary hover:opacity-100 hover:bg-primary/10" aria-label="Cancel">
          <img src="/assets/images/icons/trash.svg" alt="">
        </button>
      </form>
    `;

    $subtasksList.append(subtaskFormHTML);
    
    const $form = $subtasksList.find('.subtask-form').last();
    const $input = $form.find('.subtask-input');
    $input.focus();

    const handleSubtaskSave = () => {
      const text = $input.val().trim();
      if (text) {
        const subtaskItemHTML = `
          <div class="subtask-item" style="display: grid; grid-template-columns: auto 1fr auto; gap: 0.75rem; align-items: center; padding: 0.25rem 0;">
            <div class="subtask-checkbox-wrapper">
              <input type="checkbox" id="${newSubtaskId}" class="subtask-checkbox opacity-0 absolute cursor-pointer">
              <label for="${newSubtaskId}" class="subtask-checkbox-custom w-4 h-4 border-2 border-gray-300 rounded-full flex items-center justify-center cursor-pointer transition-all hover:border-primary"></label>
            </div>
            <span class="subtask-text text-sm text-gray-900 flex-1 transition-all">${text}</span>
            <button class="subtask-delete text-gray-500 cursor-pointer p-1 rounded transition-all opacity-70 w-7 h-7 flex items-center justify-center text-xs hover:text-primary hover:opacity-100 hover:bg-primary/10" aria-label="Delete subtask">
              <img src="/assets/images/icons/trash.svg" alt="">
            </button>
          </div>
        `;
        $form.replaceWith(subtaskItemHTML);
        saveTasksToStorage();
        saveCounters();
      } else {
        $form.remove();
      }
    };

    $form.on('submit', function(e) {
      e.preventDefault();
      handleSubtaskSave();
    });

    $input.on('keypress', function(e) {
      if (e.which === 13) { 
        e.preventDefault();
        handleSubtaskSave();
      }
    }).on('blur', handleSubtaskSave);

    $form.find('.subtask-delete').on('click', function() {
      $form.remove();
    });
  }

  /**
   * @param {jQuery} $subtaskItem
   */
  function deleteSubtask($subtaskItem) {
    $subtaskItem.css({
      opacity: '0',
      transform: 'translateX(-10px)'
    });
    
    setTimeout(() => {
      $subtaskItem.remove();
      saveTasksToStorage();
    }, 200);
  }

  /**
   */
  function clearAllExistingContent() {
    $('[data-task-id]').remove();
    $('[data-subtask-for]').remove();
    $('#completedTasks').empty();
  }

  return {
    initializeCounters: initializeCounters,
    saveCounters: saveCounters,
    formatDateForDisplay: formatDateForDisplay,
    saveTasksToStorage: saveTasksToStorage,
    saveCompletedTasksToStorage: saveCompletedTasksToStorage,
    loadTasksFromStorage: loadTasksFromStorage,
    loadCompletedTasksFromStorage: loadCompletedTasksFromStorage,
    createTaskFromData: createTaskFromData,
    createCompletedTaskFromData: createCompletedTaskFromData,
    updateCompletedTasksCount: updateCompletedTasksCount,
    createTask: createTask,
    renameTask: renameTask,
    deleteTask: deleteTask,
    restoreTask: restoreTask,
    deleteTaskPermanently: deleteTaskPermanently,
    addSubtask: addSubtask,
    deleteSubtask: deleteSubtask,
    clearAllExistingContent: clearAllExistingContent
  };
});