/* eslint-disable @cognite/no-number-z-index */
import createZIndexByIdRecord from './createZIndexByIdRecord';

describe('createZIndexByIdRecord', () => {
  it('should return an empty object when the input array is empty', () => {
    expect(createZIndexByIdRecord([])).toEqual({});
  });

  it('should create a zIndex by id record when input items have zIndex', () => {
    expect(
      createZIndexByIdRecord([
        { id: 'item1', properties: { zIndex: 1 } },
        { id: 'item2', properties: { zIndex: undefined } },
        { id: 'item3', properties: { zIndex: 3 } },
      ])
    ).toEqual({
      item1: 1,
      item2: undefined,
      item3: 3,
    });
  });

  it('should handle missing properties.zIndex', () => {
    expect(
      createZIndexByIdRecord([
        { id: 'item1', properties: {} },
        { id: 'item2', properties: { zIndex: undefined } },
        { id: 'item3' },
      ])
    ).toEqual({
      item1: undefined,
      item2: undefined,
      item3: undefined,
    });
  });
});
