import { SearchDataFormat } from './types';

export const getArrayOfItems = (
  searchResults: Record<string, any>,
  filterSections?: string[] | undefined
) => {
  const sections: string[] = Object.keys(searchResults).filter((section) =>
    filterSections ? filterSections.indexOf(section) > -1 : true
  );
  const items: SearchDataFormat[] = [];

  sections.forEach((section) => {
    if (
      searchResults[section].items &&
      searchResults[section].items.length > 0
    ) {
      searchResults[section].items.forEach((item: any) => {
        const filteredItem = {
          name: item.name,
          iconSrc: item.icon ? item.icon : 'Cube',
          section,
          description: item.description,
        };
        items.push(filteredItem);
      });
    }
  });

  return items;
};
