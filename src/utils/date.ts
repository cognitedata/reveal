import moment from 'moment';

const TIME_AND_DATE_FORMAT = 'DD.MM.YY [at] hh:mm';

export const now = () => moment().valueOf();

export const dateToFromNowDaily = (dateTime: number) => {
  return moment(dateTime).calendar(null, {
    lastDay: '[Yesterday] [at] hh:mm',
    sameDay: '[Today] [at] hh:mm',
    lastWeek: TIME_AND_DATE_FORMAT,
    sameElse: TIME_AND_DATE_FORMAT,
  });
};
