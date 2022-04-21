export const getIsoDate = (year: number, month: number, day: number) => {
  return [
    addLeadingZeros(year, 4),
    addLeadingZeros(month, 2),
    addLeadingZeros(day, 2),
  ].join('-');
};

export const getIsValidIsoDate = (date: string) =>
  /\d{4}-\d{2}-\d{2}/.test(date) && !Number.isNaN(Date.parse(date));

export const getLocaleDateString = (isoDate: string) => {
  const date = new Date(isoDate);

  if (Number.isNaN(date.getTime())) return isoDate;

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
