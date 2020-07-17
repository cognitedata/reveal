// eslint-disable-next-line @typescript-eslint/no-var-requires
const mockMetrics = require('./dist/mocks');
jest.mock('@cognite/metrics', () => mockMetrics);
