export const clientMock = {
  updateContext: jest.fn(),
  start: jest.fn(),
  stop: jest.fn(),
  on: jest.fn(),
  off: jest.fn(),
  isEnabled: jest.fn(),
};

jest.mock('unleash-proxy-client', () => ({
  UnleashClient: jest.fn().mockImplementation(() => {
    return clientMock;
  }),
}));
