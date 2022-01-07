// jest-dom adds custom jest matchers for asserting on DOM nodes.
// allows you to do things like:
// expect(element).toHaveTextContent(/react/i)
// learn more: https://github.com/testing-library/jest-dom
import '@testing-library/jest-dom/extend-expect';
// import 'styled-components/macro';
import { configure } from 'enzyme';
import Adapter from 'enzyme-adapter-react-16';
// import 'babel-polyfill';

export interface Global {
  document: Document;
  window: Window;
  ImageData: ImageData;
  XMLHttpRequest?: XMLHttpRequest;
  navigator: Navigator;
  innerWidth: number;
}

jest.mock('@cognite/sdk-provider', () => {
  return {
    useSDK: jest.fn(),
  };
});

jest.mock('@cognite/sdk-react-query-hooks', () => {
  return {
    usePermissions: () => ({ data: true, isFetched: true }),
  };
});

configure({ adapter: new Adapter() });

// Create document.currentScript required by potree-core
Object.defineProperty(document, 'currentScript', {
  value: document.createElement('script'),
});
(document.currentScript as any).src = 'http://localhost/iamdummy.html';
