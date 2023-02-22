import '@cognite/cogs.js/dist/cogs.css';
import '@testing-library/jest-dom';

import { jestPreviewConfigure } from 'jest-preview';
import noop from 'lodash/noop';

window.URL.createObjectURL = noop;

jestPreviewConfigure({ autoPreview: true });
