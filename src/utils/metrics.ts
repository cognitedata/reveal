import { trackEvent } from '@cognite/cdf-route-tracker';
import { getProject, isDevelopment } from '@cognite/cdf-utilities';
import { Metrics } from '@cognite/metrics';

export type DataCatalogEvent =
  | { e: 'data.sets.navigate' }
  | { e: 'data.explore.navigate' }
  | {
      e: 'data.sets.filter';
      searchText?: string;
      governance?: ('governed' | 'not-defined' | 'ungoverned')[];
      labels?: string[];
    }
  | { e: 'data.sets.create.click' }
  // TODO: | { e: 'data.sets.label', labels?: string[], totalLabels?: number }
  | { e: 'data.sets.view.archive.click' }
  | { e: 'data.sets.edit.click'; dataSetId?: number | string }
  | { e: 'data.sets.archive.click'; dataSetId?: number | string }
  | { e: 'data.sets.restore.click'; dataSetId?: number | string }
  // TODO: | { e: 'data.sets.labels.select' }
  | { e: 'data.sets.detail.overview' }
  | { e: 'data.sets.detail.navigate.back.click' }
  | { e: 'data.sets.detail.copy.id.click'; dataSetId?: string | number }
  | { e: 'data.sets.detail.edit.click'; dataSetId?: string | number }
  | { e: 'data.sets.detail.archive.click'; dataSetId?: number | string }
  | { e: 'data.sets.detail.restore.click'; dataSetId?: number | string }
  | { e: 'data.sets.detail.help.documentation.click'; document?: string }
  | { e: 'data.sets.detail.manage.access.click'; dataSetId?: string | number }
  | { e: 'data.sets.detail.data'; searchText?: string; filter?: string }
  | { e: 'data.sets.detail.resources.assets'; dataSetId?: string | number }
  | { e: 'data.sets.detail.resources.events'; dataSetId?: string | number }
  | { e: 'data.sets.detail.resources.files'; dataSetId?: string | number }
  | { e: 'data.sets.detail.resources.sequences'; dataSetId?: string | number }
  | { e: 'data.sets.detail.resources.timeseries'; dataSetId?: string | number }
  | {
      e: 'data.sets.detail.data.navigate.explore.resource';
      dataSetId?: string | number;
      resourceType?: string;
      resourceId?: string | number;
    }
  | { e: 'data.sets.detail.lineage' }
  | { e: 'data.sets.detail.documentation'; document?: string; link: string }
  | { e: 'data.sets.detail.access-control' };

export const trackUsage = (event: DataCatalogEvent) => {
  const { e, ...metadata } = event;

  const { host, pathname } = window?.location;
  if (!host || !pathname) {
    return;
  }

  const pathWithoutProjectName = pathname.substring(pathname.indexOf('/', 1));

  if (!host.includes('localhost')) {
    trackEvent(`data.catalog.${e}`, {
      ...metadata,
      project: getProject(),
      version: 1,
      appVersion: process.env.REACT_APP_VERSION,
      location: pathname,
      pathname: pathWithoutProjectName,
    });
  }
};

export const setupMixpanel = () => {
  const mixpanelFusionToken = '5c4d853e7c3b77b1eb4468d5329b278c'; // pragma: allowlist secret
  const mixpanelFusionDevToken = '643d35354aa468504d01f2dd33d8f726'; // pragma: allowlist secret

  const mixpanelToken = isDevelopment()
    ? mixpanelFusionDevToken
    : mixpanelFusionToken;

  Metrics.init({
    mixpanelToken,
    debug: isDevelopment(),
  });

  // We opt out of tracking if we are on development
  if (isDevelopment()) {
    Metrics.optOut();
  } else {
    Metrics.optIn();
  }
};

export const handleUserIdentification = (email: string) => {
  Metrics.identify(email || 'not-identified-yet');
  Metrics.people({
    email,
    name: email,
  });
};
