// jest-dom adds custom jest matchers for asserting on DOM nodes.
// allows you to do things like:
// expect(element).toHaveTextContent(/react/i)
// learn more: https://github.com/testing-library/jest-dom
import '@testing-library/jest-dom/extend-expect';

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

// Create document.currentScript required by potree-core
Object.defineProperty(document, 'currentScript', {
  value: document.createElement('script'),
});
document.currentScript.src = 'http://localhost/iamdummy.html';
