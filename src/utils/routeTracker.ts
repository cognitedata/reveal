// import { trackEvent as cdfRouteTrackerTrackEvent } from '@cognite/cdf-route-tracker';

// const cdfRouteTrackerTrackEvent = import('@cognite/cdf-route-tracker');

export const trackEvent = (name: string, options?: any) => {
  // return process.env.REACT_APP_IS_MOCK
  console.log('trackEvent', name);
  // : cdfRouteTrackerTrackEvent.then((module) =>
  //     module.trackEvent(name, options)
  //   );
};
