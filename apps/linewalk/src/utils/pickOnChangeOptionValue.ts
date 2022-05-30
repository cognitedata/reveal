const pickOnChangeOptionValue =
  (fn: (value: string) => void) =>
  ({ value }: { value: string }) =>
    fn(value);

export default pickOnChangeOptionValue;
