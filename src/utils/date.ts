import moment from 'moment';

const TIME_AND_DATE_FORMAT = 'DD.MM.YY [at] HH:mm';

export const now = () => moment().valueOf();

export const dateToFromNowDaily = (dateTime: number) =>
  moment(dateTime).calendar(null, {
    lastDay: '[Yesterday] [at] HH:mm',
    sameDay: '[Today] [at] HH:mm',
    lastWeek: TIME_AND_DATE_FORMAT,
    sameElse: TIME_AND_DATE_FORMAT,
  });
