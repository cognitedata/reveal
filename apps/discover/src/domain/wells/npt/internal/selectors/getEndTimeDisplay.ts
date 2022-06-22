import { getDateOrDefaultText } from 'utils/date';

import { NptInternal } from '../types';

export const getEndTimeDisplay = (event: NptInternal) => {
  return getDateOrDefaultText(event.endTime);
};
