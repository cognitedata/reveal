/*!
 * Copyright 2021 Cognite AS
 */

import mixpanel from 'mixpanel-browser';

import log from '@reveal/logger';

import { TrackedEvents, EventProps } from './types';

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

const { VERSION, MIXPANEL_TOKEN } = process.env;

// Don't identify users in MixPanel to avoid GDPR problems
const mixpanelDistinctId = 'reveal-single-user';

export class MetricsLogger {
  _sessionProps: {
    VERSION: string;
    project: string;
    application: string;
    sessionId: string;
  };

  private constructor(project: string, applicationId: string, eventProps: EventProps) {
    // Even though mixpanel has an opt out property, the mixpanel object
    // used by Metrics is not available here, so we have our own way of opting out.

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

    mixpanel.identify(mixpanelDistinctId);

    this._sessionProps = {
      VERSION,
      project: 'unknown',
      application: 'unknown',
      // Use a random identifier because we want to don't track users over multiple sessions to not
      // violate GDPR.
      sessionId: generateUuidv4()
    };

    if (project) {
      this._sessionProps.project = project;
    }
    if (applicationId) {
      this._sessionProps.application = applicationId;
    }
    this.innerTrackEvent('init', eventProps);
  }

  static init(logMetrics: boolean, project: string, applicationId: string, eventProps: EventProps): void {
    if (globalThis.revealMetricsLogger === undefined && logMetrics) {
      const metricsLogger = new MetricsLogger(project, applicationId, eventProps);
      globalThis.revealMetricsLogger = { metricsLogger };
    }
  }

  private innerTrackEvent(eventName: TrackedEvents, eventProps: EventProps): void {
    const combined = { ...this._sessionProps, ...eventProps };
    mixpanel.track(eventName, combined);
  }

  static trackEvent(eventName: TrackedEvents, eventProps: EventProps): void {
    if (globalThis.revealMetricsLogger) {
      globalThis.revealMetricsLogger.metricsLogger.innerTrackEvent(eventName, eventProps);
    }
  }

  static trackCreateTool(toolName: string): void {
    MetricsLogger.trackEvent('toolCreated', { toolName });
  }

  static trackLoadModel(eventProps: EventProps, modelIdentifier: any): void {
    MetricsLogger.trackEvent('loadModel', { ...eventProps, modelIdentifier });
  }

  static trackCadModelStyled(nodeCollectionClassToken: string, appearance: any): void {
    MetricsLogger.trackEvent('cadModelStyleAssigned', { nodeCollectionClassToken, style: appearance });
  }

  static trackError(error: Error, eventProps: EventProps): void {
    log.error(error);

    this.trackEvent('error', {
      message: error.message,
      name: error.name,
      stack: error.stack,
      ...eventProps
    });
  }

  static trackCameraNavigation(eventProps: EventProps): void {
    MetricsLogger.trackEvent('cameraNavigated', eventProps);
  }
}
