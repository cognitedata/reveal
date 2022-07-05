export const getDate = (year: number, month: number, day: number) => {
  return [
    addLeadingZeros(month, 2),
    addLeadingZeros(day, 2),
    addLeadingZeros(year, 4),
  ].join('-');
};

export const getIsValidDate = (date: string) =>
  /\d{2}-\d{2}-\d{4}/.test(date) && !Number.isNaN(Date.parse(date));

export const parseDate = (strDate: string) => {
  const date = new Date(strDate);

  if (Number.isNaN(date.getTime())) return strDate;

  return [
    addLeadingZeros(date.getMonth() + 1, 2),
    addLeadingZeros(date.getDate(), 2),
    addLeadingZeros(date.getFullYear(), 4),
  ].join('-');
};

export const addLeadingZeros = (
  number: number | string,
  maxLength: number
): string => String(number).padStart(maxLength, '0');
