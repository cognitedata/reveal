import moment from 'moment';

const TIME_AND_DATE_FORMAT = 'DD.MM.YY hh:mm';

export const shortDateTime = (dateTime: any) =>
  moment(dateTime).format(TIME_AND_DATE_FORMAT);
