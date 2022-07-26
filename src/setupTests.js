/* eslint no-console: 0 */
import { configure } from 'enzyme';
import Adapter from '@wojtekmaj/enzyme-adapter-react-17';
import 'regenerator-runtime/runtime';

configure({ adapter: new Adapter() });

jest.mock('mixpanel-browser', () => {
  return {
    'data-exploration': {
      add_group: jest.fn(),
      identify: jest.fn(),
    },
  };
});
jest.mock('app/utils/Metrics');
jest.mock('@cognite/cdf-utilities', () => ({
  createLink: jest.fn(),
}));
jest.mock('@cognite/sdk-provider', () => {
  return {
    useSDK: jest.fn(),
  };
});
