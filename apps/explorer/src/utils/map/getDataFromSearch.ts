import { GetSearchDataQueryTypeGenerated } from 'graphql/generated';

export const getDataFromSearch = (
  data: GetSearchDataQueryTypeGenerated,
  to: string,
  toType: keyof GetSearchDataQueryTypeGenerated
) => {
  /* @ts-expect-error: This expression is not callable. */
  return data[toType]?.items.find((item) => item?.externalId === to);
};
