export const getItem = (key: string) => {
  const string = localStorage.getItem(key);
  try {
    return JSON.parse(string || '');
  } catch (err) {
    return string;
  }
};
