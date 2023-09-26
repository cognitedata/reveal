import { validate } from 'uuid';

import getNewIdsMapping from './getNewIdsMapping';

describe('getNewIdsMapping', () => {
  it('should return an empty map when there are no new items', () => {
    const prevItems = [{ id: '1' }, { id: '2' }];
    const currentItems = prevItems.slice();
    const newIdsMapping = getNewIdsMapping({ prevItems, currentItems });
    expect(newIdsMapping.size).toBe(0);
  });

  it('should return a mapping of new IDs when there are new items', () => {
    const prevItems = [{ id: '1' }, { id: '2' }];
    const currentItems = [...prevItems, { id: '3' }, { id: '4' }];
    const newIdsMapping = getNewIdsMapping({ prevItems, currentItems });

    // Check if the mapping contains new IDs and they are UUIDs
    currentItems.forEach((currentItem) => {
      if (!prevItems.some((prevItem) => prevItem.id === currentItem.id)) {
        expect(newIdsMapping.get(currentItem.id)).toBeDefined();
        // eslint-disable-next-line @typescript-eslint/no-non-null-assertion
        expect(validate(newIdsMapping.get(currentItem.id)!)).toBe(true);
      }
    });
  });

  it('should return an empty map when currentItems is empty', () => {
    const prevItems = [{ id: '1' }, { id: '2' }];
    const newIdsMapping = getNewIdsMapping({ prevItems, currentItems: [] });
    expect(newIdsMapping.size).toBe(0);
  });

  it('should handle the case where prevItems is empty', () => {
    const currentItems = [{ id: '1' }, { id: '2' }];
    const newIdsMapping = getNewIdsMapping({ prevItems: [], currentItems });
    // All IDs in currentItems should have a corresponding UUID mapping
    currentItems.forEach((currentItem) => {
      expect(newIdsMapping.get(currentItem.id)).toBeDefined();
      // eslint-disable-next-line @typescript-eslint/no-non-null-assertion
      expect(validate(newIdsMapping.get(currentItem.id)!)).toBe(true);
    });
  });
});
