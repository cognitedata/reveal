const getPromiseAllValues = async <U>(
  obj: Record<string, Promise<U>>
): Promise<Record<string, U>> => {
  const keys = Object.keys(obj);
  const values = await Promise.all(Object.values(obj));
  return keys.reduce<Record<string, U>>((acc, key, index) => {
    acc[key] = values[index];
    return acc;
  }, {});
};

export default getPromiseAllValues;
