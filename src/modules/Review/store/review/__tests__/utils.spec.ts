import { convertUnsavedKeypointCollectionToUnsavedVisionImageKeypointCollection } from 'src/modules/Review/store/review/utils';
import { UnsavedKeypointCollection } from 'src/modules/Review/store/review/types';

describe('test convertUnsavedKeypointCollectionToUnsavedVisionImageKeypointCollection', () => {
  it('should reject empty', () => {
    expect(
      convertUnsavedKeypointCollectionToUnsavedVisionImageKeypointCollection(
        {} as UnsavedKeypointCollection
      )
    ).toBeNull();
  });
});
