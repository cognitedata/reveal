import { MatchFunction } from 'path-to-regexp';

import { APP_TITLE, STYLE_SCOPE, SUB_APP_TITLE } from './constants';

// Use this getContainer for all antd components such as: dropdown, tooltip, popover, modals etc
export const getContainer = () => {
  const els = document.getElementsByClassName(STYLE_SCOPE);
  const el = els.item(0) as HTMLElement;
  if (!el) {
    throw new Error('Container for antd components not found');
  }
  return el;
};

export const abbreviateText = (text: string) => {
  // Strip any text after @ symbol
  const [parsedText] = text.split('@');

  // Split by either points or spaces
  const splitTexts = parsedText.split(/[. ]/g);
  const abbr = splitTexts.map((t) => t[0]).join('');

  return abbr;
};

export const matchesAny = (location: Location, matchers: MatchFunction[]) =>
  matchers.some((routeMatcher) => !!routeMatcher(location.pathname));

export const updatePageTitle = () => {
  const homePageTitle = `${APP_TITLE} | ${SUB_APP_TITLE}`;
  document.title = homePageTitle;
};
