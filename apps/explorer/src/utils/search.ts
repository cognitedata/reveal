import { ListData } from 'components/List';

type SearchDataFormat = ListData & { section: string };

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

export const getObjectsFromItems = (items: SearchDataFormat[]) => {
  const itemsObj: Record<string, NonEmptyArr<ListData>> = {};

  items.forEach((item) => {
    const filteredItem = {
      name: item.name,
      iconSrc: item.iconSrc ? item.iconSrc : 'Cube',
      description: item.description,
    };
    if (!itemsObj[item.section]) itemsObj[item.section] = [filteredItem];
    else itemsObj[item.section].push(filteredItem);
  });

  return itemsObj;
};
