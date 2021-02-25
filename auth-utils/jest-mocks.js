// eslint-disable-next-line @typescript-eslint/no-var-requires
const mockAuth = require('./dist/mocks');

jest.mock('@cognite/auth-utils', () => mockAuth);

module.exports = mockAuth;
