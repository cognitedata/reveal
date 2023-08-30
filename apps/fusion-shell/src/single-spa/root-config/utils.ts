import { MatchFunction } from 'path-to-regexp';

export const matchesAny = (location: Location, matchers: MatchFunction[]) =>
  matchers.some((routeMatcher) => !!routeMatcher(location.pathname));
