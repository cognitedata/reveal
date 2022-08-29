export const getStringPixelWidth = (string: string) => {
  const canvas = document.createElement('canvas');
  const context = canvas.getContext('2d');

  return Math.round(context?.measureText(string).width || 0);
};
