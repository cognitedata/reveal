import dayjs from 'dayjs';

import { EXTRACTORS_DATE_FORMAT } from '../common';

export const formatTimeStamp = (date: number) => {
  return dayjs(date).format(EXTRACTORS_DATE_FORMAT);
};
