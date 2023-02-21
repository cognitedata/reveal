import '@cognite/cogs.js/dist/cogs.css';
import 'rc-collapse/assets/index.css';
import 'react-datepicker/dist/react-datepicker.css';

import { jestPreviewConfigure } from 'jest-preview';
import noop from 'lodash/noop';

window.URL.createObjectURL = noop;

jestPreviewConfigure({ autoPreview: true });
