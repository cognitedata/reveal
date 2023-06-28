/* eslint no-console: 0 */
import 'regenerator-runtime/runtime';
import Enzyme from 'enzyme';
import Adapter from '@wojtekmaj/enzyme-adapter-react-17';
import noop from 'lodash/noop';

Enzyme.configure({ adapter: new Adapter() });

jest.mock('./utils/Metrics');

window.URL.createObjectURL = noop;

jest.mock('@cognite/unified-file-viewer', () => ({}));
jest.mock('@plotting-components', () => ({}));
jest.mock('@cognite/data-exploration', () => ({}));

jest.mock('@cognite/unified-file-viewer', () => {
  return {
    ToolType: {
      RECTANGLE: 'rectangle',
      SELECT: 'select',
      ELLIPSE: 'ellipse',
      POLYLINE: 'polyline',
      LINE: 'line',
      TEXT: 'text',
      IMAGE: 'image',
      PAN: 'pan',
    },
  };
});
