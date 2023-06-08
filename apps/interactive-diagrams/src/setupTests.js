/* eslint no-console: 0 */
import 'regenerator-runtime/runtime';
import Enzyme from 'enzyme';
import Adapter from '@wojtekmaj/enzyme-adapter-react-17';
import noop from 'lodash/noop';

Enzyme.configure({ adapter: new Adapter() });

jest.mock('./utils/Metrics');

window.URL.createObjectURL = noop;

jest.mock('@cognite/unified-file-viewer', () => ({}));
jest.mock('@cognite/plotting-components', () => ({}));
jest.mock('@cognite/data-exploration', () => ({}));
