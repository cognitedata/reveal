import { Document } from '@cognite/sdk';

import { SHORT_DATE_FORMAT, getDateOrDefaultText } from '../../utils/date';

import { getModifiedDate } from './getModifiedDate';

export const getModifiedDateDisplay = (doc: Document) => {
  return getDateOrDefaultText(getModifiedDate(doc), SHORT_DATE_FORMAT);
};
