const logReturn =
  (message: string) =>
  <T>(value: T): T => {
    /* eslint-disable-next-line no-console */
    console.log(message, value);
    return value;
  };

export default logReturn;
