import {
  mockAsset,
  mockAsset2,
  mockAsset4,
  rootAsset1,
} from '../../stubs/assets';
import { concatParents } from '../assets/service/utils/concatParents';

describe('concatParents util function', () => {
  it('should concat data correctly', () => {
    const data = [
      { ...rootAsset1, children: [{ ...mockAsset, children: [mockAsset2] }] },
      {
        ...rootAsset1,
        children: [mockAsset4],
      },
    ];
    const result = concatParents(data);
    expect(result[0].children).toHaveLength(2);
    expect(result[0].children && result[0].children[0].id).toEqual(
      mockAsset.id
    );
    expect(result[0].children && result[0].children[1].id).toEqual(
      mockAsset4.id
    );
    expect(
      result[0].children &&
        result[0].children[0].children &&
        result[0].children[0].children[0].id
    ).toEqual(mockAsset2.id);
  });
});
