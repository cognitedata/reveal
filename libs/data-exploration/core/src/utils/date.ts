export const isDateInDateRange = (date?: Date, dateRange?: [Date, Date]) => {
  if (date && dateRange && date >= dateRange[0] && date <= dateRange[1]) {
    return true;
  }
  return false;
};
