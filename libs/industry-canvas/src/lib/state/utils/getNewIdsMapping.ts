import { differenceBy } from 'lodash';
import { v4 as uuid } from 'uuid';

const getNewIdsMapping = <T extends { id: string }>({
  prevItems,
  currentItems,
}: {
  prevItems: T[];
  currentItems: T[];
}): Map<string, string> => {
  // Maps from the previous ID to the new unique id
  const newIdsMapping = new Map();
  const newItems = differenceBy(currentItems, prevItems, 'id');
  currentItems.forEach((currentItem) => {
    if (newItems.some(({ id }) => id === currentItem.id)) {
      newIdsMapping.set(currentItem.id, uuid());
    }
  });
  return newIdsMapping;
};

export default getNewIdsMapping;
