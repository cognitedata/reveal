export function shallowCompareProperties(
  obj1: { [key: string]: any },
  obj2: { [key: string]: any }
) {
  return (
    Object.keys(obj1).length === Object.keys(obj2).length &&
    Object.keys(obj1).every((key) => obj1[key] === obj2[key])
  );
}
