import { trackEvent } from '@cognite/cdf-route-tracker';

const getPathWithoutTenant = (pathName: string) => {
  const pathWithoutTenant = pathName.substring(pathName.indexOf('/', 1));
  return pathWithoutTenant;
};

export type TrackUsageFn = (
  eventName: string,
  metadata?: Record<string, unknown>
) => void;

type CreateTrackUsageProps = {
  app: string;
  version?: number;
};

export const createTrackUsage =
  (props: CreateTrackUsageProps): TrackUsageFn =>
  (eventName, metadata) => {
    const options = {
      ...metadata,
      ...(props.version !== undefined && { version: props.version }),
      app: props.app,
      appVersion: process.env.REACT_APP_VERSION,
      location: window.location.pathname,
      pathname: getPathWithoutTenant(window.location.pathname),
    };

    if (process.env.NODE_ENV === 'development') {
      // eslint-disable-next-line no-console
      console.log('Metrics.track', { eventName, ...options });
    }

    trackEvent(eventName, options);
  };
