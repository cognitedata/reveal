import dayjs from 'dayjs';
export const isDateInDateRange = (date?: Date, dateRange?: [Date, Date]) => {
  if (date && dateRange && date >= dateRange[0] && date <= dateRange[1]) {
    return true;
  }
  return false;
};

export const formatDateToDatePickerString = (date: Date) => {
  return dayjs(date).format('YYYY/MM/DD HH:mm');
};
