import { UNIX_TIMESTAMP_FACTOR } from 'typings/interfaces';
import { formatDate } from 'utils/date';

// TODO_: Move this to a helpers file, and update other references that duplicate this logic
export const getFormattedTimestampOrString = (revision: string | number) => {
  if (new Date(Number(revision) * UNIX_TIMESTAMP_FACTOR).getTime() > 0) {
    return formatDate(Number(revision));
  }
  return revision;
};
