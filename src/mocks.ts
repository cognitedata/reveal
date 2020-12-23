import type { Stub } from './types';

const stub = {
  start: () => ({
    stop: () => undefined,
  }),
  track: () => undefined,
};

export const Metrics = {
  create: (): Stub => stub,
  stop: (): void => undefined,
  init: (): void => undefined,
  optOut: (): void => undefined,
  optIn: (): void => undefined,
  props: (): void => undefined,
  hasOptedOut: (): boolean => false,
  identify: (): void => undefined,
  people: (): void => undefined,
};

export const useMetrics = (): Stub => stub;
