export const getDateTimeInputValue = (date: Date) => {
  return new Date(
    new Date('Sun May 11,2014').getTime() - date.getTimezoneOffset() * 60000
  )
    .toISOString()
    .slice(0, 16);
};
