// eslint-disable-next-line @typescript-eslint/no-var-requires
const mockAuth = require('./dist/mocks');

jest.mock('@cognite/auth-utils', () => {
  const original = jest.requireActual('@cognite/auth-utils');
  return {
    ...original,
    ...mockAuth,
  };
});

module.exports = mockAuth;
