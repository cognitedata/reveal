/*!
 * Copyright 2020 Cognite AS
 */

declare let VERSION: string;
declare let MIXPANEL_TOKEN: string;

import mixpanel from 'mixpanel-browser';

type TrackedEvents = 'init' | 'addModel' | 'error';
type EventProps = {
  [key: string]: any;
  // names mentioned instead of just `string` type for typo protection,
  // better than nothing, easier than anything else
  moduleName:
    | 'RevealManager'
    | 'Cognite3DViewer'
    | 'CadManager'
    | 'CachedRepository'
    | 'Cognite3DModel'
    | 'LocalHostRevealManager'
    | 'sectorUtilities';
  methodName: string;
};

let globalLogMetrics = true;
const globalProps = {
  VERSION: VERSION,
  project: 'unknown'
};

export function initMetrics(logMetrics: boolean, project: string, eventProps: EventProps) {
  // Even though mixpanel has an opt out property, the mixpanel object
  // used by Metrics is not available here, so we have our own way of opting out.
  globalLogMetrics = logMetrics;
  if (!globalLogMetrics) {
    return;
  }
  mixpanel.init(MIXPANEL_TOKEN, { persistence: 'localStorage' });
  globalProps.VERSION = VERSION;
  if (project) {
    globalProps.project = project;
  }

  trackEvent('init', eventProps);
}

export function trackEvent(eventName: TrackedEvents, eventProps: EventProps) {
  if (!globalLogMetrics) {
    return;
  }
  const combined = { ...globalProps, ...eventProps };
  mixpanel.track(eventName, combined);
}

export function trackAddModel<TModelIdentifier>(eventProps: EventProps, modelIdentifier: TModelIdentifier) {
  trackEvent('addModel', { ...eventProps, modelIdentifier });
}

export function trackError(error: Error, eventProps: EventProps) {
  console.error(error);

  trackEvent('error', {
    message: error.message,
    name: error.name,
    stack: error.stack,
    ...eventProps
  });
}
