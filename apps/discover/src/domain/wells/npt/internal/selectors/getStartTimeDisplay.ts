import { getDateOrDefaultText } from 'utils/date';

import { NptInternal } from '../types';

export const getStartTimeDisplay = (event: NptInternal) => {
  return getDateOrDefaultText(event.startTime);
};
