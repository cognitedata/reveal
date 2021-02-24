import * as mixpanelConfig from 'mixpanel-browser';
import sdk, { getAuthState } from 'sdk-singleton';

export const ENTITY_MATCHING_METRICS = {
  pipeline: {
    start: 'EntityMatching.pipeline.start',
    created: 'EntityMatching.pipeline.created',
    rerun: 'EntityMatching.pipeline.rerun',
    finish: 'EntityMatching.pipeline.finish',
    selectData: 'EntityMatching.pipeline.data',
    config: 'EntityMatching.pipeline.config',
    duplicate: 'EntityMatching.pipeline.duplicate',
    delete: 'EntityMatching.pipeline.delete',
    edit: 'EntityMatching.pipeline.edit',
    cancelCreate: 'EntityMatching.pipeline.cancelCreate',
    open: 'EntityMatching.pipeline.open',
    saveToCdf: 'EntityMatching.pipeline.saveToCdf',
    byPattern: 'EntityMatching.pipeline.byPattern',
    byMatchItem: 'EntityMatching.pipeline.byMatchItem',
    saveToPipeline: 'EntityMatching.pipeline.saveToPipeline',
    tabChange: 'EntityMatching.pipeline.results.tabChange',
  },
  quickMatch: {
    start: 'EntityMatching.quickmatch.start',
    selectData: 'EntityMatching.quickmatch.data',
    config: 'EntityMatching.quickmatch.config',
    saveToCdf: 'EntityMatching.quickmatch.saveToCdf',
    byPattern: 'EntityMatching.quickmatch.byPattern',
    byMatchItem: 'EntityMatching.quickmatch.byMatchItem',
    tabChange: 'EntityMatching.quickmatch.results.tabChange',
  },
  search: {
    assetSearch: 'EntityMatching.search.assetSearch',
    assetSelect: 'EntityMatching.search.assetSelect',
  },
  manualMatching: {
    apply: 'EntityMatching.manualMatching.apply',
    assetSearch: 'EntityMatching.manualMatching.assetSearch',
  },
  results: {
    tab: 'EntityMatching.results.activeTab',
  },
};

const MIXPANEL_TOKEN = '5c4d853e7c3b77b1eb4468d5329b278c'; // pragma: allowlist secret

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
