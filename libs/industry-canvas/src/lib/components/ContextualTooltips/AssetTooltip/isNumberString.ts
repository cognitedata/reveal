const isNumberString = (value: string | unknown): boolean => {
  return !isNaN(Number(value));
};

export default isNumberString;
