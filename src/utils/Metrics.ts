import { Metrics, ITimer } from '@cognite/metrics';
import { isDevelopment } from './URLUtils';

let mixpanelToken = '5c4d853e7c3b77b1eb4468d5329b278c'; // fusion token

if (isDevelopment()) {
  mixpanelToken = '643d35354aa468504d01f2dd33d8f726'; // fusion-dev token
}

Metrics.init({ mixpanelToken });

const mixpanel = Metrics.create('DataExplorer');

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

  if (host.indexOf('localhost') === -1) {
    mixpanel.track(event, {
      ...metadata,
      version: 1,
      appVersion: process.env.REACT_APP_VERSION,
      location: window.location.pathname,
      pathname: pathWithoutTenant,
    });
  }
};

export class Timer {
  private timer: ITimer | undefined;

  private finished = false;

  constructor(event: string, startProps: Props = {}) {
    try {
      this.timer = mixpanel.start(event, startProps);
      // eslint-disable-next-line no-empty
    } catch (e) {}
  }

  stop(props: Props = {}) {
    if (this.finished) {
      return;
    }
    try {
      if (this.timer) {
        this.timer.stop(props);
      }
      this.finished = true;
      // eslint-disable-next-line no-empty
    } catch (e) {}
  }
}

export function trackTimedUsage(event: string, props?: Props): Timer {
  return new Timer(event, props);
}
