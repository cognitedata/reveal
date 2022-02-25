import { MILLISECONDS_IN_SECOND, SECONDS_IN_MINUTE } from './constants';

export const adaptLocalEpochToUTC = (dateInEpoch: number) => {
  const offsetInMinutes = new Date().getTimezoneOffset();
  return (
    dateInEpoch - offsetInMinutes * SECONDS_IN_MINUTE * MILLISECONDS_IN_SECOND
  );
};
