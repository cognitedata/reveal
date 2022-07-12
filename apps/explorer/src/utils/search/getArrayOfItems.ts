import { GetSearchDataQueryTypeGenerated } from 'graphql/generated';

import { SearchDataFormat } from './types';

export const getArrayOfItems = (
  searchResults: GetSearchDataQueryTypeGenerated,
  filterSections?: string[] | undefined
) => {
  const items: SearchDataFormat[] = [];
  if (!searchResults) return items;

  const sections = Object.keys(searchResults).filter((section) =>
    filterSections ? filterSections.indexOf(section) > -1 : true
  ) as Array<keyof GetSearchDataQueryTypeGenerated>;

  sections.forEach((section) => {
    const sectionItems = searchResults[section]?.items || [];
    sectionItems.forEach((item: any) => {
      const filteredItem = {
        ...item,
        iconSrc: item.icon ? item.icon : 'Cube',
        section,
      };
      items.push(filteredItem);
    });
  });

  return items;
};
