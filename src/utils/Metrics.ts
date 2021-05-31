import { trackEvent } from '@cognite/cdf-route-tracker';
import sdk, { getAuthState } from 'sdk-singleton';

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
    trackEvent(`ContextUIPnid.${event}`, {
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
      trackEvent(`EngineeringDiagrams.time_event`, event);
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

export const PNID_METRICS = {
  landingPage: {
    startNew: 'EngineeringDiagrams.landingPage.startNew',
    editFile: 'EngineeringDiagrams.landingPage.editFile',
    viewFile: 'EngineeringDiagrams.landingPage.viewFile',
    deleteAnnotations: 'EngineeringDiagrams.landingPage.deleteAnnotations',
    previewFile: 'EngineeringDiagrams.landingPage.previewFile',
    useSearch: 'EngineeringDiagrams.landingPage.useSearch',
    loadMore: 'EngineeringDiagrams.landingPage.loadMore',
  },
  selection: 'EngineeringDiagrams.selection',
  filters: {
    byDataSet: 'EngineeringDiagrams.filters.byDataSet',
    byLabels: 'EngineeringDiagrams.filters.byLabels',
    bySearch: 'EngineeringDiagrams.filters.bySearch',
  },
  configuration: 'EngineeringDiagrams.configuration',
  parsingJob: {
    start: 'EngineeringDiagrams.pasringJob.start',
    end: 'EngineeringDiagrams.pasringJob.end',
    results: 'EngineeringDiagrams.pasringJob.results',
  },
  convertingJob: 'EngineeringDiagrams.convertingJob.time',
  results: {
    convertToSvg: 'EngineeringDiagrams.results.convertToSvg',
    linkToAssets: 'EngineeringDiagrams.results.linkToAssets',
  },
  navigation: {
    stepsWizard: 'EngineeringDiagrams.navigation.stepsWizard',
    nextButton: 'EngineeringDiagrams.navigation.nextButton',
    backButton: 'EngineeringDiagrams.navigation.backButton',
    breadcrumbs: 'EngineeringDiagrams.navigation.breadcrumbs',
  },
  fileViewer: {
    convertToSvg: 'EngineeringDiagrams.fileViewer.convertToSvg',
    linkToAssets: 'EngineeringDiagrams.fileViewer.linkToAssets',
    manualTags: 'EngineeringDiagrams.fileViewer.manualTags',
    viewTab: 'EngineeringDiagrams.fileViewer.viewTab',
    deleteAnnotations: 'EngineeringDiagrams.fileViewer.deleteAnnotations',
  },
};
