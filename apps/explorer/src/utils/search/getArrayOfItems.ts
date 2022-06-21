import { SearchPeopleRoomsQueryTypeGenerated } from 'graphql/generated';

import { SearchDataFormat } from './types';

export const getArrayOfItems = (
  searchResults: SearchPeopleRoomsQueryTypeGenerated | undefined,
  filterSections?: string[] | undefined
) => {
  const items: SearchDataFormat[] = [];
  if (!searchResults) return items;

  const sections = Object.keys(searchResults).filter((section) =>
    filterSections ? filterSections.indexOf(section) > -1 : true
  ) as Array<keyof SearchPeopleRoomsQueryTypeGenerated>;

  sections.forEach((section) => {
    const sectionItems = searchResults[section]?.items || [];
    sectionItems.forEach((item: any) => {
      const filteredItem = {
        id: item.externalId,
        name: item.name,
        iconSrc: item.icon ? item.icon : 'Cube',
        section,
        description: item.description,
      };
      items.push(filteredItem);
    });
  });

  return items;
};
