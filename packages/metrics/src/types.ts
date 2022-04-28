import { Dict } from 'mixpanel-browser';
import { MutableRefObject } from 'react';

export type Callback = () => void;

export type Properties = Dict;

export interface ITimer {
  stop: (props?: Properties, callback?: Callback) => void;
}

export interface MetricsDebugger {
  readonly isDebug?: boolean;
  track: (event: string, props: Properties) => void;
  stop: (event: string, props: Properties) => void;
}

export type InitOptions = {
  mixpanelToken: string;
  metricsDebugger?: MetricsDebugger;
  persistence?: 'cookie' | 'localStorage';
} & Properties;

export type Stub = {
  start: () => { stop: () => undefined };
  track: () => undefined;
};

export type PerfMetricsInitOptions = {
  frontendMetricsBaseUrl: string;
  accessToken: string;
  project: string;
  headers: FetchHeaders;
};

export type PerfMonitorResultsData = {
  start: number;
  end: number;
  duration: number;
};

export type PerfMonitor = {
  name: string;
  tags?: string;
  slow?: boolean;
  eventType?: keyof HTMLElementEventMap;
  domSelector?: string;
  selectIndex?: number;
  ref?: MutableRefObject<HTMLElement | null>;
  callback?: () => void;
};

export type mutationType = 'addedNodes' | 'removedNodes';

export type MutationSearchProps = {
  mutations: MutationRecord[];
  type: string;
  searchIn: mutationType[];
  searchBy: string;
  searchValue: string;
  searchFor: string;
  callback: (results: MutationSearchResults) => void;
};

export type MutationSearchResults = {
  addedNodes: boolean;
  removedNodes: boolean;
};

export type FetchHeaders = {
  [key: string]: string;
};
