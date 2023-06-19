// // jest-dom adds custom jest matchers for asserting on DOM nodes.
// // allows you to do things like:
// // expect(element).toHaveTextContent(/react/i)
// // learn more: https://github.com/testing-library/jest-dom
// import '@testing-library/jest-dom/extend-expect';

// jest.mock('@cognite/cdf-sdk-singleton', () => ({
//   getUserInformation: jest.fn().mockResolvedValue({ displayName: 'test-user' }),
// }));

// jest-dom adds custom jest matchers for asserting on DOM nodes.
// allows you to do things like:
// expect(element).toHaveTextContent(/react/i)
// learn more: https://github.com/testing-library/jest-dom
import '@testing-library/jest-dom/extend-expect';

import 'styled-components/macro';
import { configure } from 'enzyme';
import Adapter from 'enzyme-adapter-react-16';
import 'babel-polyfill';

export interface Global {
  document: Document;
  window: Window;
  ImageData: ImageData;
  XMLHttpRequest?: XMLHttpRequest;
  navigator: Navigator;
  innerWidth: number;
}

jest.mock('@cognite/cdf-sdk-singleton', () => {
  return {
    getUserInformation: jest
      .fn()
      .mockResolvedValue({ displayName: 'test-user' }),
  };
});

configure({ adapter: new Adapter() });
