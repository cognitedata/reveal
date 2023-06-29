import { jestPreviewConfigure } from 'jest-preview';
import '@cognite/cogs.js/dist/cogs.css';
import '@testing-library/jest-dom';
import noop from 'lodash/noop';

window.URL.createObjectURL = noop;

jestPreviewConfigure({ autoPreview: true });

jest.mock('@cognite/cdf-sdk-singleton', () => ({
  getUserInformation: jest.fn().mockResolvedValue({ displayName: 'test-user' }),
}));

jest.mock('@cognite/unified-file-viewer', () => ({}));

jest.mock('@data-exploration-lib/core', () => ({
  ...jest.requireActual('@data-exploration-lib/core'),
  useTranslation: () => ({
    t: (_key, referenceValue, _options) => {
      return referenceValue;
    },
  }),
}));
