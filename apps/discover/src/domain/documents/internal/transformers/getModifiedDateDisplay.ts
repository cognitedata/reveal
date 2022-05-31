import { getDateOrDefaultText } from 'utils/date';
import { SHORT_DATE_FORMAT } from 'utils/date/constants';

import { Document } from '@cognite/sdk';

import { getModifiedDate } from './getModifiedDate';

export const getModifiedDateDisplay = (doc: Document) => {
  return getDateOrDefaultText(getModifiedDate(doc), SHORT_DATE_FORMAT);
};
