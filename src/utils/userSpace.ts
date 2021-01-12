import { LastVisited } from 'store/userSpace/types';
import find from 'lodash/find';
import isEqual from 'lodash/isEqual';

export const findLastVisitedTimeByKey = (
  lastVisited: LastVisited[],
  key: string
): number => {
  const lastVisitedItem = find(lastVisited, (item) => isEqual(item.key, key));
  return (lastVisitedItem as LastVisited)?.lastVisitedTime;
};
