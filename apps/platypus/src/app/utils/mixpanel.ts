import config from '@platypus-app/config/config';
import mixpanel, { Dict } from 'mixpanel-browser';

export const TRACKING_TOKENS = {
  UIEditor: 'UI Editor used',
  BreakingChanges: 'Applied breaking changes',
  CodeEditor: 'Code Editor used',
  Publishing: 'Publishing data model',
  VersionSelection: 'Version selection',
  PageView: 'Page view',
  Transformations: 'Created transformation via platypus',
  Discard: 'Discarded data model',
  SelectDM: 'Selected data model',
};
mixpanel.init(config.MIXPANEL_TOKEN);

export const Mixpanel = {
  track: (eventName: string, properties?: Dict) => {
    mixpanel.track(eventName, properties);
  },
};
