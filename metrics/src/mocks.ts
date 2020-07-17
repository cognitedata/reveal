const stub = {
  start: () => ({
    stop: () => null,
  }),
  track: () => undefined,
};

export const Metrics = {
  create: () => stub,
  stop: () => null,
  init: () => undefined,
};

export const useMetrics = () => stub;
