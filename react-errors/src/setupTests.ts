// jest-dom adds custom jest matchers for asserting on DOM nodes.
// allows you to do things like:
// expect(element).toHaveTextContent(/react/i)
// learn more: https://github.com/testing-library/jest-dom
import '@testing-library/jest-dom/extend-expect';
import { configureI18n } from '@cognite/react-i18n';

configureI18n();

jest.mock('@cognite/metrics', () => {
  const stub = {
    start: () => ({
      stop: () => null,
    }),
    track: () => undefined,
  };

  return {
    Metrics: {
      create: () => stub,
      stop: () => null,

      init: () => undefined,
    },
    useMetrics: () => stub,
  };
});
