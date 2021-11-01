export const getSelectEntriesFromMap = (obj: { [key: string]: string }) =>
  Object.entries(obj).map(([value, label]) => ({
    label,
    value,
  }));
