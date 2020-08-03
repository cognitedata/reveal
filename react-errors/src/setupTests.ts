import '@testing-library/jest-dom';
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
