/* eslint-disable @typescript-eslint/no-explicit-any */
import sidecar from './sidecar';
import config from './config';

// Add Intercom type to window
declare global {
  interface Window {
    Intercom: any;
  }
}

type IntercomData = {
  appId?: string;
  email?: string;
};

export function intercomBoot(data: IntercomData) {
  const { intercom: appId } = sidecar;
  if (config.env !== 'development' && window.Intercom) {
    window.Intercom('boot', {
      ...data,
      appId,
      hide_default_launcher: true,
    });
  }
}

export function intercomUpdate(data: IntercomData = {}) {
  const time = parseInt(`${new Date().getTime() / 1000}`, 10);
  if (config.env !== 'development' && window.Intercom) {
    window.Intercom('update', {
      ...data,
      last_request_at: time,
    });
  }
}
