// eslint-disable-next-line @typescript-eslint/no-var-requires
const mocks = require('./dist/mocks');
jest.mock('@cognite/react-errors', () => mocks);
