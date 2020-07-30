const stub = {
  start: () => ({
    stop: () => undefined,
  }),
  track: () => undefined,
};

export const Metrics = {
  create: () => stub,
  stop: () => undefined,
  init: () => undefined,
  optOut: () => undefined,
  optIn: () => undefined,
  props: () => undefined,
  hasOptedOut: () => false,
  identify: () => undefined,
  people: () => undefined,
};

export const useMetrics = () => stub;
