import { LastVisited } from 'store/userSpace/types';
import find from 'lodash/find';

export const findLastVisitedTimeByKey = (
  lastVisited: LastVisited[],
  key: string
): number => {
  const lastVisitedItem = find(lastVisited, (item) => item.key === key);
  return (lastVisitedItem as LastVisited)?.lastVisitedTime;
};
