import { getBooleanSelection } from '../utils';

const items = ['item1', 'item2', 'item3'];

describe('getBooleanSelection', () => {
  it('should return boolean selected with `true` as value', () => {
    const booleanSelection = getBooleanSelection(items, true);
    expect(booleanSelection).toEqual({
      item1: true,
      item2: true,
      item3: true,
    });
  });

  it('should return boolean selected with `false` as value', () => {
    const booleanSelection = getBooleanSelection(items, false);
    expect(booleanSelection).toEqual({
      item1: false,
      item2: false,
      item3: false,
    });
  });
});
