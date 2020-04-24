module.exports = {
  create: () => ({
    start: () => ({
      stop: () => null,
    }),
    track: () => null,
  }),
  stop: () => null,

  init: jest.fn(),
};
