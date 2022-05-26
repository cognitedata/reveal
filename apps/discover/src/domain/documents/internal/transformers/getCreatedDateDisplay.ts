import { getDateOrDefaultText } from 'utils/date';
import { SHORT_DATE_FORMAT } from 'utils/date/constants';

import { Document } from '@cognite/sdk';

import { getCreatedDate } from './getCreatedDate';

export const getCreatedDateDisplay = (doc: Document) => {
  return getDateOrDefaultText(getCreatedDate(doc), SHORT_DATE_FORMAT);
};
