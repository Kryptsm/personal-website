/**
 * Debug Utilities for Wordle Application
 * Centralized debug logging system
 */

// Global debug flag - set to true to enable debug logging
const DEBUG_ENABLED = false;

/**
 * Debug logger that only logs when DEBUG_ENABLED is true
 * @param {...any} args - Arguments to log
 */
export function debugLog(...args) {
  if (DEBUG_ENABLED) {
    console.log(...args);
  }
}

/**
 * Debug logger with prefix for specific modules
 * @param {string} module - Module name (e.g., 'ALGORITHM', 'UI', 'SUGGESTIONS')
 * @param {...any} args - Arguments to log
 */
export function debugLogModule(module, ...args) {
  if (DEBUG_ENABLED) {
    console.log(`[${module}]`, ...args);
  }
}

/**
 * Debug logger for warnings
 * @param {...any} args - Arguments to log
 */
export function debugWarn(...args) {
  if (DEBUG_ENABLED) {
    console.warn(...args);
  }
}

/**
 * Debug logger for errors (always logs, regardless of debug flag)
 * @param {...any} args - Arguments to log
 */
export function debugError(...args) {
  console.error(...args);
}

/**
 * Check if debug mode is enabled
 * @returns {boolean} True if debug mode is enabled
 */
export function isDebugEnabled() {
  return DEBUG_ENABLED;
}

/**
 * Enable or disable debug mode (useful for runtime toggling)
 * Note: This won't work with const DEBUG_ENABLED, but provides the interface
 * @param {boolean} enabled - Whether to enable debug mode
 */
export function setDebugMode(enabled) {
  // In a real implementation, you'd need to make DEBUG_ENABLED mutable
  // For now, this is just a placeholder for the interface
  console.warn(
    "Debug mode can only be changed by modifying DEBUG_ENABLED constant in debugUtils.js"
  );
}

export { DEBUG_ENABLED };
