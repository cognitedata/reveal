import { SearchPeopleRoomsQueryTypeGenerated } from 'graphql/generated';

export const getDataFromSearch = (
  data: SearchPeopleRoomsQueryTypeGenerated,
  to: string,
  toType: keyof SearchPeopleRoomsQueryTypeGenerated
) => {
  return data[toType]?.items.find((item) => item?.externalId === to);
};
