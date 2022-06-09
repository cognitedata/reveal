import { ListData } from 'components/List';

import { SearchDataFormat } from './types';

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
