import { sortByOrder, sortArrayByOrder } from '../sortByOrder';

describe('sortByOrder', () => {
  it('should be ok', () => {
    expect(
      sortByOrder({ a: { order: 2 }, c: { order: 1 }, b: { order: 3 } })
    ).toEqual([{ order: 1 }, { order: 2 }, { order: 3 }]);
  });
});
describe('sortArrayByOrder', () => {
  it('should be ok', () => {
    expect(
      sortArrayByOrder([{ order: 2 }, { order: 1 }, { order: 3 }])
    ).toEqual([{ order: 1 }, { order: 2 }, { order: 3 }]);
  });
});
