import { format } from 'date-fns';
import { UNIX_TIMESTAMP_FACTOR } from 'typings/interfaces';

// TODO_: Move this to a helpers file, and update other references that duplicate this logic
export const getFormattedTimestampOrString = (revision: string | number) => {
  if (new Date(Number(revision) * UNIX_TIMESTAMP_FACTOR).getTime() > 0) {
    return format(new Date(Number(revision) * UNIX_TIMESTAMP_FACTOR), 'Pp');
  }
  return revision;
};
