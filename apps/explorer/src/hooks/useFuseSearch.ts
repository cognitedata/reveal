import Fuse from 'fuse.js';
import { getObjectsFromItems } from 'utils/search';
import { SearchDataFormat } from 'utils/search/types';

export const useFuseSearch = (
  query: string,
  itemsArray: SearchDataFormat[]
) => {
  const fuse = new Fuse(itemsArray, {
    keys: ['name', 'description'],
    includeScore: true,
  });
  const results = fuse.search(query);

  // if there is no query, we should by default show all the items
  const listItems =
    query.length === 0 ? itemsArray : results.map((item) => item.item);

  return getObjectsFromItems(listItems);
};
