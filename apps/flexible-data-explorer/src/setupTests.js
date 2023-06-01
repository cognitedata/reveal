/* eslint no-console: 0 */
import '@testing-library/jest-dom';
import { configure } from 'enzyme';
import Adapter from '@wojtekmaj/enzyme-adapter-react-17';
import 'regenerator-runtime/runtime';
import noop from 'lodash/noop';

window.URL.createObjectURL = noop;

configure({ adapter: new Adapter() });

jest.mock('@cognite/cdf-i18n-utils', () => ({
  useTypedTranslation: jest.fn(),
}));
