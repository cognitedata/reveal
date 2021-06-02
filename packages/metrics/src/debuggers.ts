import { MetricsDebugger, Properties } from './types';

/**
 * A simple {@link MetricsDebugger} implementation which doesn't do anything.
 * This is intended to be used on production builds.
 */
export const NoopDebugger: MetricsDebugger = {
  isDebug: false,
  track: () => undefined,
  stop: () => undefined,
};

/**
 * A {@link MetricsDebugger} implementation which logs to console. This is
 * useful for debugging development / staging builds.
 */
export const ConsoleDebugger: MetricsDebugger = {
  isDebug: true,

  track: (event: string, props: Properties) => {
    /* eslint-disable-next-line no-console */
    console.log(`Metrics.track(${event})`, props);
  },

  stop: (event: string, props: Properties) => {
    // eslint-disable-next-line no-console
    console.log(`Timer.stop(${event})`, props);
  },
};
