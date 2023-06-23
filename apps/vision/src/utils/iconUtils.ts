export const getIcon = (text?: string) => {
  if (text && text === 'person') {
    return 'User';
  }
  return 'Scan';
};
