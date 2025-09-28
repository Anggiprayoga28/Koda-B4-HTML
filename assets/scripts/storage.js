define(['jquery'], function($) {
  'use strict';
  
  const STORAGE_KEYS = {
    TASKS: 'wazwez_tasks',
    COMPLETED_TASKS: 'wazwez_completed_tasks',
    TASK_COUNTER: 'wazwez_task_counter',
    SUBTASK_COUNTER: 'wazwez_subtask_counter'
  };

  /**
   * @param {string} key
   * @param {*} data 
   */
  function saveToLocalStorage(key, data) {
    try {
      localStorage.setItem(key, JSON.stringify(data));
    } catch (error) {
      console.error('Error saving to localStorage:', error);
    }
  }

  /**
   * @param {string} key
   * @param {*} defaultValue
   * @returns {*} 
   */
  function loadFromLocalStorage(key, defaultValue = null) {
    try {
      const data = localStorage.getItem(key);
      return data ? JSON.parse(data) : defaultValue;
    } catch (error) {
      console.error('Error loading from localStorage:', error);
      return defaultValue;
    }
  }

  /**
   * @param {string} key 
   */
  function removeFromLocalStorage(key) {
    try {
      localStorage.removeItem(key);
    } catch (error) {
      console.error('Error removing from localStorage:', error);
    }
  }

  /**
   */
  function clearAllData() {
    try {
      Object.values(STORAGE_KEYS).forEach(key => {
        localStorage.removeItem(key);
      });
    } catch (error) {
      console.error('Error clearing localStorage:', error);
    }
  }

  /**
   * @returns {boolean}
   */
  function isStorageAvailable() {
    try {
      const test = '__storage_test__';
      localStorage.setItem(test, test);
      localStorage.removeItem(test);
      return true;
    } catch (error) {
      return false;
    }
  }

  return {
    STORAGE_KEYS: STORAGE_KEYS,
    save: saveToLocalStorage,
    load: loadFromLocalStorage,
    remove: removeFromLocalStorage,
    clearAll: clearAllData,
    isAvailable: isStorageAvailable
  };
});