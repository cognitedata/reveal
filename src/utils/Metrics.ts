import * as mixpanelConfig from 'mixpanel-browser';
import sdk, { getAuthState } from 'sdk-singleton';

const MIXPANEL_TOKEN = '504cfc7feaad55b838d866aff8f91a58';

const mixpanel = mixpanelConfig.init(
  MIXPANEL_TOKEN,
  { persistence: 'localStorage' },
  'datastudio'
);

export type Props = { [key: string]: string | number | boolean | Props | null };

export const trackUsage = (
  event: string,
  metadata?: { [key: string]: any }
) => {
  const { host } = window?.location;
  const { pathname } = window?.location;
  if (!host || !pathname) {
    return;
  }

  const pathWithoutTenant = pathname.substring(pathname.indexOf('/', 1));

  const { username } = getAuthState();

  if (host.indexOf('localhost') === -1) {
    mixpanel.track(event, {
      ...metadata,
      project: sdk.project,
      version: 1,
      appVersion: process.env.REACT_APP_VERSION,
      location: window.location.pathname,
      user: username,
      pathname: pathWithoutTenant,
    });
  }
};

export class Timer {
  private timerEvent: string;

  private startProps: Props = {};

  private finished = false;

  constructor(event: string, startProps: Props = {}) {
    this.timerEvent = event;
    this.startProps = startProps;

    try {
      mixpanel.time_event(event);
      // eslint-disable-next-line no-empty
    } catch (e) {}
  }

  stop(props: Props = {}) {
    if (this.finished) {
      return;
    }
    try {
      const combined = { ...this.startProps, ...props };
      trackUsage(this.timerEvent, combined);
      this.finished = true;
      // eslint-disable-next-line no-empty
    } catch (e) {}
  }
}

export function trackTimedUsage(event: string, props?: Props): Timer {
  return new Timer(event, props);
}
