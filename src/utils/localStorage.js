import * as Sentry from '@sentry/browser';

export const setItemInStorage = (key, data) => {
  try {
    localStorage.setItem(key, JSON.stringify(data));
  } catch (e) {
    Sentry.captureException(e);
  }
};

export const getItemFromStorage = (key) => {
  try {
    const data = localStorage.getItem(key);
    return data ? JSON.parse(data) : undefined;
  } catch (e) {
    Sentry.captureException(e);
    return undefined;
  }
};

export const removeItemFromStorage = (key) => {
  try {
    localStorage.removeItem(key);
  } catch (e) {
    Sentry.captureException(e);
  }
};
