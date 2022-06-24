import { SearchPeopleRoomsQueryTypeGenerated } from 'graphql/generated';

export const getDataFromMap = (
  data: SearchPeopleRoomsQueryTypeGenerated,
  to: string
) => {
  const keys = Object.keys(data);

  for (let i = 0; i < keys.length; i++) {
    const key = keys[i] as keyof SearchPeopleRoomsQueryTypeGenerated;
    const item = data[key]?.items.find((item: any) => {
      if (item.nodeId) return String(item.nodeId) === to;
      return false;
    });

    if (item) return item;
  }

  return undefined;
};
