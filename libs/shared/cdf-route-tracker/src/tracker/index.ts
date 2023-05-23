import { getUserInformation } from '@cognite/cdf-sdk-singleton';
import { Metrics } from '@cognite/metrics';

// fusion token
const mixpanelToken = '5c4d853e7c3b77b1eb4468d5329b278c'; // pragma: allowlist secret

export const checkUrl = (env: string) => window.location.hostname.includes(env);
export const isDevelopment = () => checkUrl('dev') || checkUrl('localhost');
export const isStaging = () =>
  checkUrl('staging') || checkUrl('pr') || checkUrl('next-release');
export const isProduction = () => !(isStaging() || isDevelopment());

export const getCluster = (search?: string) => {
  if (!search) return undefined;
  return new URLSearchParams(search).get('cluster') || undefined;
};

// Because of privacy reasons, no events should be sent for these clusters.
const disableTracking = () => {
  const DONT_TRACK_ME_DOMAINS = ['statnett.fusion.cognite.com'];
  const DONT_TRACK_ME_CLUSTERS = [
    'statnett.cognitedata.com',
    'power-no.cognitedata.com',
    'az-power-no-northeurope.cognitedata.com',
  ];
  const cluster = getCluster(window.location.search) || '';
  return (
    DONT_TRACK_ME_CLUSTERS.includes(cluster) ||
    DONT_TRACK_ME_DOMAINS.includes(window.location.hostname)
  );
};

export type Tracker = {
  track: (name: string, options?: any) => void;
};

const tracker = (): Tracker => {
  let metrics: Metrics | undefined;
  let identified = false;

  const track = (name: string, options?: any) => {
    if (disableTracking()) {
      return;
    }
    const { hostname } = window.location;
    const customerDomain = hostname.split('.')[0];
    const fusionDomain = hostname.split('.').slice(1).join('.');
    if (!metrics) {
      Metrics.init({
        mixpanelToken,
        applicationId: 'fusion',
        cluster: getCluster(window.location.search),
        hostname,
        customerDomain,
        fusionDomain,
      });
      Metrics.optIn();
      metrics = Metrics.create();
    }
    const { pathname } = window.location;
    const project = pathname.split('/')[1];
    const props = { ...options, pathname, project };

    if (identified) {
      metrics.track(name, props);
    } else {
      getUserInformation()
        .then(({ id, mail, userPrincipalName, displayName }) => {
          identified = true;
          if (id) {
            Metrics.identify(id);
            Metrics.people({
              id,
              name: displayName,
              email: mail || userPrincipalName,
            });
          }
          metrics?.track(name, props);
        })
        .catch(() => {
          metrics?.track(name, props);
        });
    }
  };

  return { track };
};

export default tracker;
