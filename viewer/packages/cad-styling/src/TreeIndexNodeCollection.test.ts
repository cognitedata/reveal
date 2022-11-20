import { IndexSet, NumericRange } from '@reveal/utilities';
import { TreeIndexNodeCollection } from './TreeIndexNodeCollection';

describe(TreeIndexNodeCollection.classToken, () => {
  test('updateSet with same IndexSet as current, doesnt clear set', () => {
    const set = new IndexSet();
    const collection = new TreeIndexNodeCollection(set);
    set.addRange(new NumericRange(1, 10));
    collection.updateSet(set);
    expect(set.count).not.toEqual(0);
  });
});
