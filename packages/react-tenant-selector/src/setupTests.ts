// jest-dom adds custom jest matchers for asserting on DOM nodes.
// allows you to do things like:
// expect(element).toHaveTextContent(/react/i)
// learn more: https://github.com/testing-library/jest-dom
import '@testing-library/jest-dom';

import mocks from '@cognite/auth-utils/mocks';

jest.mock('@cognite/auth-utils', () => {
  const original = jest.requireActual('@cognite/auth-utils');
  return {
    ...original,
    ...mocks,
  };
});

jest.mock('@cognite/react-i18n', () => {
  const actual = jest.requireActual('@cognite/react-i18n');
  return {
    ...actual,
    // this mock makes sure any components using the translate hook can use it without a warning being shown
    useTranslation: () => ({
      t: (str: string, options?: { defaultValue: string }) =>
        options ? options.defaultValue : str,
      i18n: {
        // changeLanguage: () => new Promise(() => {}),
      },
    }),
  };
});
