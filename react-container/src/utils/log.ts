export const log = <T>(message: string, data: T[] = [], level = 3) => {
  if (level === 1) {
    // eslint-disable-next-line no-console
    console.log(message, ...data);
  }
  if (level === 2) {
    // eslint-disable-next-line no-console
    console.warn(message, ...data);
  }
  if (level === 3) {
    // eslint-disable-next-line no-console
    console.error(message, ...data);
  }
};
