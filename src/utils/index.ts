export const getIdParam = (id: number | string) => {
  if (typeof id === 'string') {
    return { externalId: id };
  }
  return { id };
};

export const sleep = (milliseconds: number) => {
  return new Promise(resolve => setTimeout(resolve, milliseconds));
};
