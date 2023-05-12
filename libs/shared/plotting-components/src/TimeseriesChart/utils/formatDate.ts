import dayjs from 'dayjs';

import { AXIS_DATE_FORMAT } from '../constants';

export const formatDate = (date: Date) => {
  return dayjs(date).format(AXIS_DATE_FORMAT);
};
