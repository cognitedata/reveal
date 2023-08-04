const isNumberString = (value: string): boolean => {
  return !isNaN(Number(value));
};

export default isNumberString;
