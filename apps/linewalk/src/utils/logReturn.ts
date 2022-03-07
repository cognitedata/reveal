const logReturn =
  (tag: string, condition = true) =>
  <T>(returnValue: T): T => {
    if (condition) {
      /* eslint-disable-next-line no-console */
      console.log(tag, returnValue);
    }
    return returnValue;
  };

export default logReturn;
