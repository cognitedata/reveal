import compareItemsByZIndex from './compareItemsByZIndex'; // Import your function here

describe('compareItemsByZIndex', () => {
  const zIndexById = {
    item1: 2,
    item2: 1,
    item3: undefined,
    item4: 3,
  };

  it('should maintain the current order if zIndexA and zIndexB are undefined', () => {
    const itemA = { id: 'item5' };
    const itemB = { id: 'item6' };
    const result = compareItemsByZIndex(itemA, itemB, zIndexById);
    expect(result).toBe(0);
  });

  it('should move itemA to the end if zIndexA is undefined', () => {
    const itemA = { id: 'item3' };
    const itemB = { id: 'item4' };
    const result = compareItemsByZIndex(itemA, itemB, zIndexById);
    expect(result).toBe(1); // itemA (zIndex undefined) should come after itemB (zIndex 3)
  });

  it('should move itemB to the end if zIndexB is undefined', () => {
    const itemA = { id: 'item1' };
    const itemB = { id: 'item3' };
    const result = compareItemsByZIndex(itemA, itemB, zIndexById);
    expect(result).toBe(-1); // itemB (zIndex undefined) should come after itemA (zIndex 2)
  });

  it('should sort items by zIndex', () => {
    const itemA = { id: 'item2' };
    const itemB = { id: 'item4' };
    const result = compareItemsByZIndex(itemA, itemB, zIndexById);
    expect(result).toBe(-2); // item2 (zIndex 1) should come before item4 (zIndex 3)
  });

  it('should sort list of items by zIndex', () => {
    expect(
      [{ id: 'item2' }, { id: 'item4' }, { id: 'item1' }, { id: 'item3' }].sort(
        (a, b) => compareItemsByZIndex(a, b, zIndexById)
      )
    ).toEqual([
      { id: 'item2' },
      { id: 'item1' },
      { id: 'item4' },
      { id: 'item3' },
    ]);
  });
});
