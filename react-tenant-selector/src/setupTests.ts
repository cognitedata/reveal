// jest-dom adds custom jest matchers for asserting on DOM nodes.
// allows you to do things like:
// expect(element).toHaveTextContent(/react/i)
// learn more: https://github.com/testing-library/jest-dom
import '@testing-library/jest-dom';

import '@cognite/metrics/jest-mocks';

// import { configureI18n } from '@cognite/react-i18n';

// configureI18n({locize: {projectId: 'dfcacf1f-a7aa-4cc2-94d7-de6ea4e66f1d', apiKey: '679d5a83-bc71-4d5e-9e32-f8560603166b'}})

jest.mock('react-i18next', () => ({
  // this mock makes sure any components using the translate hook can use it without a warning being shown
  useTranslation: () => {
    return {
      t: (str: string, options?: { defaultValue: string }) =>
        options ? options.defaultValue : str,
      i18n: {
        // changeLanguage: () => new Promise(() => {}),
      },
    };
  },
}));

// browserMocks.js
const localStorageMock = (() => {
  let store: { [s: string]: string } = {};

  return {
    getItem(key: string) {
      return store[key] || null;
    },
    setItem(key: string, value: string) {
      store[key] = value.toString();
    },
    clear() {
      store = {};
    },
  };
})();

Object.defineProperty(window, 'localStorage', {
  value: localStorageMock,
});
