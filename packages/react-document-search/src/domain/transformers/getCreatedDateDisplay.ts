import { Document } from '@cognite/sdk';

import { getDateOrDefaultText } from '../../utils/date';

import { SHORT_DATE_FORMAT } from './constants';
import { getCreatedDate } from './getCreatedDate';

export const getCreatedDateDisplay = (doc: Document) => {
  return getDateOrDefaultText(getCreatedDate(doc), SHORT_DATE_FORMAT);
};
