/*!
 * Copyright 2021 Cognite AS
 */

import * as THREE from 'three';
import mixpanel, { Config } from 'mixpanel-browser';
import { Log } from '@reveal/logger';

import { TrackedEvents, EventProps } from './types';
import throttle from 'lodash/throttle';

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

/**
 * Specifies what type of metrics to send to Mixpanel.
 */
export enum MetricsMode {
  /**
   * No metrics is sent to Mixpanel.
   */
  NoMetrics = 1,
  /**
   * Only anonymous metrics is sent to Mixpanel, no information about location, IP, hardware
   * is sent to Mixpanel and no cookies are used.
   */
  AnonymousMetrics = 2,
  /**
   * Detailed metrics are sent to Mixpanel, including IP, location, hardware. Cookies are used
   * to track users between sessions.
   */
  DetailedMetrics = 3,
  /**
   * Details to {@link AnonymousMetrics}.
   */
  Default = AnonymousMetrics
}

interface MixpanelInitializer {
  init(): { sessionId: string };
}

class AnonymousMixpanelInitializer implements MixpanelInitializer {
  private static readonly Config: Partial<Config> = {
    batch_requests: true,
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
  };

  init(): { sessionId: string } {
    // Even though mixpanel has an opt out property, the mixpanel object
    // used by Metrics is not available here, so we have our own way of opting out.
    mixpanel.init(MIXPANEL_TOKEN!, AnonymousMixpanelInitializer.Config);
    // Reset device ID (even if we don't send it)
    mixpanel.reset();

    mixpanel.identify(mixpanelDistinctId);

    // Use a random identifier because we want to don't track users over multiple sessions to not
    // violate GDPR.
    return { sessionId: generateUuidv4() };
  }
}

class IdentifiedUserMixpanelInitializer implements MixpanelInitializer {
  private static readonly Config: Partial<Config> = {
    batch_requests: true
  };

  init(): { sessionId: string } {
    mixpanel.init(MIXPANEL_TOKEN!, IdentifiedUserMixpanelInitializer.Config);
    return { sessionId: mixpanel.get_distinct_id() };
  }
}

export class MetricsLogger {
  private readonly _sessionProps: {
    VERSION: string;
    project: string;
    application: string;
    sessionId: string;
  };

  private static readonly TrackCameraNavigationThrottleDelay = 5000;
  private static readonly TrackCadNodeTransformOverriddenThrottleDelay = 1000;

  public static globalMetricsLogger: MetricsLogger;

  private constructor(sessionId: string, project: string, applicationId: string, eventProps: EventProps) {
    this._sessionProps = {
      VERSION: VERSION!,
      project: project ?? 'unknown',
      application: applicationId ?? 'unknown',
      sessionId
    };
    this.innerTrackEvent('init', eventProps);
  }

  static init(metricsMode: MetricsMode, project: string, applicationId: string, eventProps: EventProps): void {
    if (this.globalMetricsLogger === undefined) {
      switch (metricsMode) {
        case MetricsMode.NoMetrics:
          break;

        case MetricsMode.AnonymousMetrics: {
          const { sessionId } = new AnonymousMixpanelInitializer().init();
          this.globalMetricsLogger = new MetricsLogger(sessionId, project, applicationId, eventProps);
          break;
        }

        case MetricsMode.DetailedMetrics: {
          const { sessionId } = new IdentifiedUserMixpanelInitializer().init();
          this.globalMetricsLogger = new MetricsLogger(sessionId, project, applicationId, eventProps);
          break;
        }

        default:
          throw new Error(`Unsupported metrics mode '${metricsMode}'`);
      }
    } else {
      Log.warn('Mixpanel metrics already initialized.');
    }
  }

  private innerTrackEvent(eventName: TrackedEvents, eventProps: EventProps): void {
    const combined = { ...this._sessionProps, ...eventProps };
    mixpanel.track(eventName, combined);
  }

  static trackEvent(eventName: TrackedEvents, eventProps: EventProps): void {
    if (MetricsLogger.globalMetricsLogger) {
      this.globalMetricsLogger.innerTrackEvent(eventName, eventProps);
    }
  }

  static trackCreateTool(toolName: string): void {
    MetricsLogger.trackEvent('toolCreated', { toolName });
  }

  static trackLoadModel(eventProps: EventProps, modelIdentifier: any, modelVersion: number): void {
    MetricsLogger.trackEvent('loadModel', { ...eventProps, modelIdentifier, modelVersion });
  }

  static trackCadModelStyled(nodeCollectionClassToken: string, appearance: any): void {
    MetricsLogger.trackEvent('cadModelStyleAssigned', { nodeCollectionClassToken, style: appearance });
  }

  private static readonly trackCadNodeTransformOverriddenVars = {
    zeroVector: new THREE.Vector3(0, 0, 0),
    oneVector: new THREE.Vector3(1, 1, 1),
    identityRotation: new THREE.Quaternion().identity(),

    translation: new THREE.Vector3(),
    scale: new THREE.Vector3(),
    rotation: new THREE.Quaternion()
  };

  /**
   * Track use of CAD node transform overrides. Note that the metric is throttled and will only trigger
   * once per second.
   * @param nodeCount Number of nodes affected by the transform override
   * @param matrix  Matrix used to override the node transform
   */
  static readonly trackCadNodeTransformOverridden = throttle(
    (nodeCount: number, matrix: THREE.Matrix4) => MetricsLogger.trackCadNodeTransformOverriddenImpl(nodeCount, matrix),
    MetricsLogger.TrackCadNodeTransformOverriddenThrottleDelay
  );

  private static trackCadNodeTransformOverriddenImpl(nodeCount: number, matrix: THREE.Matrix4): void {
    const { zeroVector, oneVector, identityRotation, translation, scale, rotation } =
      MetricsLogger.trackCadNodeTransformOverriddenVars;
    matrix.decompose(translation, rotation, scale);

    const hasRotation = Math.abs(rotation.angleTo(identityRotation)) > 1e-5;
    const hasTranslation = translation.distanceToSquared(zeroVector) > 1e-5;
    const hasScale = scale.distanceToSquared(oneVector) > 1e-5;
    MetricsLogger.trackEvent('cadNodeTransformOverridden', {
      nodeCount,
      hasTranslation,
      hasRotation,
      hasScale
    });
  }

  /**
   * Track camera navigation events. Note that the metric is throttled and will only trigger
   * once per second.
   */
  static readonly trackCameraNavigation = throttle(
    (eventProps: EventProps) => MetricsLogger.trackCameraNavigationImpl(eventProps),
    MetricsLogger.TrackCameraNavigationThrottleDelay
  );

  private static trackCameraNavigationImpl(eventProps: EventProps): void {
    MetricsLogger.trackEvent('cameraNavigated', eventProps);
  }

  static trackError(error: Error, eventProps: EventProps): void {
    Log.error(error);

    if (error !== undefined) {
      this.trackEvent('error', {
        message: error.message || error,
        name: error.name,
        stack: error.stack,
        ...eventProps
      });
    } else {
      this.trackEvent('error', {
        name: 'unknown',
        ...eventProps
      });
    }
  }
}
