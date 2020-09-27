import jest from 'jest';

module.exports = {
  default: {
    assets: {},
    events: {},
    sequences: {},
    files: {},
    timeseries: {},
      // get: jest.fn().mockResolvedValue([]),
      // post: jest.fn().mockResolvedValue([]),
  },
  getAuthState: () => {},
  loginAndAuthIfNeeded: () => {},
};
