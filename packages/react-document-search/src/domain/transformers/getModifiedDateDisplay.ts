import { getDateOrDefaultText } from 'utils/date';
import { Document } from '@cognite/sdk';

import { SHORT_DATE_FORMAT } from '../../utils/date';

import { getModifiedDate } from './getModifiedDate';

export const getModifiedDateDisplay = (doc: Document) => {
  return getDateOrDefaultText(getModifiedDate(doc), SHORT_DATE_FORMAT);
};
