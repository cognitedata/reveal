import { getDateOrDefaultText } from 'utils/date';

import { NPTEvent } from 'modules/wellSearch/types';

export const getStartTimeDisplay = (event: NPTEvent) => {
  return getDateOrDefaultText(event.startTime);
};
