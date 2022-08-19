import { trackEvent } from '@cognite/cdf-route-tracker';
import sdk from '@cognite/cdf-sdk-singleton';
import { getItemFromStorage } from 'hooks/useLocalStorage';

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

  const pathWithoutProject = pathname.substring(pathname.indexOf('/', 1));
  const username = getItemFromStorage('context-ui-pnid-username') ?? 'unknown';

  if (host.indexOf('localhost') === -1) {
    trackEvent(`EngineeringDiagrams.${event}`, {
      ...metadata,
      project: sdk.project,
      version: 1,
      appVersion: process.env.REACT_APP_VERSION,
      location: pathname,
      user: username,
      pathname: pathWithoutProject,
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
      trackEvent(`time_event`, event);
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
    startNew: 'landingPage.startNew',
    editFile: 'landingPage.editFile',
    viewFile: 'landingPage.viewFile',
    deleteAnnotations: 'landingPage.deleteAnnotations',
    previewFile: 'landingPage.previewFile',
    useSearch: 'landingPage.useSearch',
    loadMore: 'landingPage.loadMore',
  },
  selection: 'selection',
  filters: {
    byDataSet: 'filters.byDataSet',
    byLabels: 'filters.byLabels',
    bySearch: 'filters.bySearch',
    byRootAsset: 'filters.byRootAsset',
    byMimeType: 'filters.byMimeType',
  },
  configPage: {
    skipSettings: 'configPage.skipSettings',
    configuration: 'configPage.configuration',
  },
  parsingJob: {
    start: 'parsingJob.start',
    end: 'parsingJob.end',
    results: 'parsingJob.results',
  },
  convertingJob: {
    start: 'convertingJob.start',
    end: 'convertingJob.end',
    time: 'convertingJob.time',
  },
  results: {
    convertToSvg: 'results.convertToSvg',
    linkToAssets: 'results.linkToAssets',
  },
  navigation: {
    stepsWizard: 'navigation.stepsWizard',
    nextButton: 'navigation.nextButton',
    backButton: 'navigation.backButton',
    breadcrumbs: 'navigation.breadcrumbs',
    moveToStep: 'navigation.moveToStep',
  },
  fileViewer: {
    convertToSvg: 'fileViewer.convertToSvg',
    linkToAssets: 'fileViewer.linkToAssets',
    manualTags: 'fileViewer.manualTags',
    viewTab: 'fileViewer.viewTab',
    deleteAnnotations: 'fileViewer.deleteAnnotations',
  },
  betaBanner: {
    close: 'betaBanner.close',
    feedback: 'betaBanner.feedback',
  },
};
