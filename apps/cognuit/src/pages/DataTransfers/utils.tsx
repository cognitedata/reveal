import { formatDate } from 'utils/date';

// TODO_: Move this to a helpers file, and update other references that duplicate this logic
export const getFormattedTimestampOrString = (revision: string | number) => {
  if (new Date(Number(revision)).getTime() > 0) {
    return formatDate(Number(revision));
  }
  return revision;
};
