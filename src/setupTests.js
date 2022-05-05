/**
 * Mock ResizeObserver
 */
global.ResizeObserver = require('resize-observer-polyfill');

/**
 * Mock matchMedia
 */
Object.defineProperty(window, 'matchMedia', {
  value: () => {
    return {
      matches: false,
      addListener: () => {},
      removeListener: () => {}
    };
  }
});
