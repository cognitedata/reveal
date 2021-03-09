export const getFieldValue = <T>(
  fieldName: keyof Partial<T>,
  object: Partial<T> = {}
): Partial<T>[keyof Partial<T>] | null => {
  if (fieldName in object) {
    return object[fieldName];
  }
  return null;
};
