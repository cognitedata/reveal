import mixpanel, {
  People,
  OutTrackingOptions,
  InTrackingOptions,
  HasOptedInOutOptions,
} from 'mixpanel-browser';

import {
  Properties,
  ITimer,
  Callback,
  IClassName,
  InitOptions,
  MetricsDebugger,
} from './types';
import { ConsoleDebugger, NoopDebugger } from './debuggers';

const globalProperties: Properties = {};

class Timer implements ITimer {
  private timerEvent = '';
  private startProps: Properties = {};

  constructor(event: string, startProps: Properties) {
    this.timerEvent = event;
    this.startProps = startProps;
    try {
      mixpanel.time_event(event);
    } catch (e) {
      console.warn(`Unable to track ${this.timerEvent}`);
    }
  }

  public stop(properties: Properties = {}, callback?: Callback) {
    try {
      const combined = {
        ...globalProperties,
        ...this.startProps,
        ...properties,
      };
      // Mixpanel modifies their params, so spread the props.
      mixpanel.track(this.timerEvent, { ...combined }, callback);
      // eslint-disable-next-line @typescript-eslint/no-use-before-define
      Metrics.DEBUGGER.stop(this.timerEvent, combined);
    } catch (e) {
      // eslint-disable-next-line no-console
      console.warn(`Unable to track ${this.timerEvent}`);
    }
  }
}

class Metrics {
  static DEBUGGER: MetricsDebugger = NoopDebugger;
  private readonly className: string;
  private readonly properties: Properties = {};

  public static init({
    mixpanelToken,
    debug,
    metricsDebugger,
    persistence,
    ...properties
  }: InitOptions) {
    if (!mixpanelToken) {
      throw new Error('Missing mixpanelToken parameter');
    }
    mixpanel.init(mixpanelToken, {
      persistence: persistence === 'cookie' ? 'cookie' : 'localStorage',
    });

    if (metricsDebugger) {
      Metrics.DEBUGGER = metricsDebugger;
    } else if (
      debug === true ||
      debug === 'true' ||
      process.env.REACT_APP_DEBUG_METRICS === 'true'
    ) {
      Metrics.DEBUGGER = ConsoleDebugger;
    }

    Metrics.props({
      // Log this by default to be able to separate the metrics.
      environment:
        process.env.REACT_APP_ENV || process.env.NODE_ENV || 'unknown',
      // These are auto-populated when built with FAS.
      releaseId: process.env.REACT_APP_RELEASE_ID || 'unknown-release',
      applicationId: process.env.REACT_APP_APP_ID || 'unknown-app',
      versionName: process.env.REACT_APP_VERSION_NAME || '0.0.0',
      ...properties,
    });
  }

  public static optOut(options?: Partial<OutTrackingOptions>) {
    mixpanel.opt_out_tracking(options);
  }

  public static optIn(options?: Partial<InTrackingOptions>) {
    mixpanel.opt_in_tracking(options);
  }

  public static hasOptedOut(options?: Partial<HasOptedInOutOptions>): boolean {
    return mixpanel.has_opted_out_tracking(options);
  }

  public static props(properties: Properties) {
    Object.keys(properties)
      .filter((key) => key !== 'mixpanelToken' && key !== 'debug')
      .forEach((key) => {
        const value = properties[key] || null;
        switch (typeof value) {
          case 'string':
          case 'number':
          case 'boolean':
          case 'undefined':
            globalProperties[key] = value;
            break;
          default:
            if (value === null) {
              // typeof null is 'object', so it needs to be special-cased.
              globalProperties[key] = value;
            } else {
              /* eslint-disable-next-line no-console */
              console.warn(
                `Not adding { "${key}": "${
                  Metrics.DEBUGGER.isDebug ? value : '<value>'
                }" } to the metrics. Only simple data types are supported.`
              );
              delete globalProperties[key];
              break;
            }
        }
      });
  }

  public static identify(uid: string) {
    mixpanel.identify(uid);
  }

  public static people(info: People) {
    mixpanel.people.set(info);
  }

  public static create(className: string, properties: Properties = {}) {
    return new Metrics(className, properties, false);
  }

  public static stop(
    possibleTimer: ITimer,
    properties: Properties = {},
    callback?: Callback
  ) {
    if (Metrics.DEBUGGER.isDebug || (possibleTimer && possibleTimer.stop)) {
      possibleTimer.stop(properties, callback);
    }
  }

  private constructor(
    className: IClassName,
    properties: Properties = {},
    deprecated = true
  ) {
    if (deprecated === true) {
      console.warn(
        'new Metrics(..) has been deprecated; please use Metrics.create(..) instead.'
      );
    }

    this.className = String(className.name || className);
    this.properties = { ...properties };
  }

  public start(name: string, properties: Properties = {}): ITimer {
    return new Timer(`${this.className}.${name}`, {
      ...this.properties,
      ...properties,
    });
  }

  public track(name: string, properties: Properties = {}, callback?: Callback) {
    const combined = { ...globalProperties, ...this.properties, ...properties };
    try {
      const event = `${this.className}.${name}`;
      // Mixpanel modifies their params, so spread the props.
      mixpanel.track(event, { ...combined }, callback);
      Metrics.DEBUGGER.track(event, combined);
    } catch (e) {
      /* eslint-disable-next-line no-console */
      console.warn(`Unable to track ${this.className}.${name}`);
    }
  }
}

export default Metrics;
