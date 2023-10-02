import { CdfHistoryUser } from './CdfHistoryUser';

export const getUserHistoryLocalStorageKey = (user: CdfHistoryUser) =>
  `@cognite/fusion/browsing-history-${user.id}-${user.cluster}-${user.project}`;
