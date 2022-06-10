import { getDateOrDefaultText } from 'utils/date';

import { NPTEvent } from 'modules/wellSearch/types';

export const getEndTimeDisplay = (event: NPTEvent) => {
  return getDateOrDefaultText(event.endTime);
};
