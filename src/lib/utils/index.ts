export const formatMetadata = (metadata: { [key: string]: any }) =>
  Object.keys(metadata).reduce(
    (agg, cur) => agg.concat([{ key: cur, value: String(metadata[cur]) }]),
    [] as { key: string; value: string }[]
  );

export const getIdParam = (id: number | string) => {
  if (typeof id === 'string') {
    return { externalId: id };
  }
  return { id };
};

export const sleep = (milliseconds: number) => {
  return new Promise(resolve => setTimeout(resolve, milliseconds));
};
