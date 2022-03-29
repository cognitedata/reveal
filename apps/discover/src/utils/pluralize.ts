export const pluralize = (text: string, value?: number | unknown[]) => {
  let count: number;

  if (Array.isArray(value)) {
    count = value.length;
  } else if (typeof value === 'number') {
    count = value;
  } else {
    count = 0;
  }

  return `${text}${count <= 1 ? '' : 's'}`;
};
