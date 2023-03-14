export const getTickTextWidth = (text: string | null | undefined) => {
  if (!text) {
    return 0;
  }

  const canvas = document.createElement('canvas');
  const context = canvas.getContext('2d');

  if (!context) {
    return 0;
  }

  context.font = 'Inter';

  return context.measureText(text).width;
};
