const stub = {
  start: () => ({
    stop: () => null,
  }),
  track: () => undefined,
};

module.exports = {
  Metrics: {
    create: () => stub,
    stop: () => null,

    init: () => undefined,
  },
  useMetrics: () => stub,
};
