import tracker from './tracker';
import './set-public-path';

const metrics = tracker();

export function trackEvent(name: string, options?: any) {
  try {
    metrics.track(name, options);
    // eslint-disable-next-line no-empty
  } catch {}
}
