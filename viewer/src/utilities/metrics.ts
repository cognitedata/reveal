/*!
 * Copyright 2020 Cognite AS
 */

import mixpanel from 'mixpanel-browser';

type TrackedEvents = 'init' | 'construct3dViewer' | 'loadModel' | 'error' | 'cameraNavigated';
type EventProps = {
  [key: string]: any;
  // names mentioned instead of just `string` type for typo protection,
  // better than nothing, easier than anything else
  moduleName:
    | 'RevealManager'
    | 'createRevealManager'
    | 'Cognite3DViewer'
    | 'CadManager'
    | 'Cognite3DModel'
    | 'sectorUtilities';
  methodName: string;
};

const { VERSION, MIXPANEL_TOKEN } = process.env;

let globalLogMetrics = true;
const globalProps = {
  VERSION,
  project: 'unknown',
  application: 'unknown'
};

/**
 * Source: https://stackoverflow.com/a/2117523/167251
 */
function generateUuidv4(): string {
  return 'xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx'.replace(/[xy]/g, function (c) {
    const r = (Math.random() * 16) | 0,
      v = c == 'x' ? r : (r & 0x3) | 0x8;
    return v.toString(16);
  });
}

export function initMetrics(logMetrics: boolean, project: string, applicationId: string, eventProps: EventProps) {
  // Even though mixpanel has an opt out property, the mixpanel object
  // used by Metrics is not available here, so we have our own way of opting out.
  globalLogMetrics = logMetrics;
  if (!globalLogMetrics) {
    return;
  }

  mixpanel.init(MIXPANEL_TOKEN, {
    disable_cookie: true,
    disable_persistence: true,
    // Don't send IP which disables geolocation
    ip: false,
    // Avoid sending a bunch of properties that might help identifying a user
    property_blacklist: [
      // https://help.mixpanel.com/hc/en-us/articles/115004613766-Default-Properties-Collected-by-Mixpanel#profile-properties-javascript
      '$city',
      '$region',
      'mp_country_code',
      '$geo_source',
      '$timezone',
      'mp_lib',
      '$lib_version',
      '$device_id',
      '$user_id',
      '$current_url',
      '$screen_width',
      '$screen_height',
      '$referrer',
      '$referring_domain',
      '$initial_referrer',
      '$initial_referring_domain'
    ]
  });
  // Reset device ID (even if we don't send it)
  mixpanel.reset();

  // Use a random identifier because we want to don't track users over multiple sessions to not
  // violate GDPR. This overrides "distinct_id".
  const randomIdentifier = generateUuidv4();
  mixpanel.identify(randomIdentifier);

  if (project) {
    globalProps.project = project;
  }
  if (applicationId) {
    globalProps.application = applicationId;
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

export function trackLoadModel(eventProps: EventProps, modelIdentifier: any) {
  trackEvent('loadModel', { ...eventProps, modelIdentifier });
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

export function trackCameraNavigation(eventProps: EventProps) {
  trackEvent('cameraNavigated', eventProps);
}
