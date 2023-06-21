import { GenericSort } from 'src/modules/Common/Utils/SortUtils';
import { mockFileIds, mockFileInfo } from 'src/__test-utils/data/mockFileInfo';
import { getIdsFromFileInfo } from 'src/__test-utils/getIdsFromFileInfo';
import { shuffle } from 'src/__test-utils/shuffle';

const unsortedMockFileInfo = shuffle(mockFileInfo);

const sortedIdsReversed = [...mockFileIds].reverse();

describe('Testing GenericSort fn', () => {
  it('Items sorted by createdTime', () => {
    const sortedData = GenericSort(unsortedMockFileInfo, 'createdTime', false);
    expect(getIdsFromFileInfo(sortedData)).toStrictEqual(mockFileIds);
  });
  it('Items reversed sorted by createdTime', () => {
    const sortedData = GenericSort(unsortedMockFileInfo, 'createdTime', true);
    expect(getIdsFromFileInfo(sortedData)).toStrictEqual(sortedIdsReversed);
  });
  it('Items sorted by uploadedTime', () => {
    const sortedData = GenericSort(unsortedMockFileInfo, 'uploadedTime', false);
    expect(getIdsFromFileInfo(sortedData)).toStrictEqual(mockFileIds);
  });
  it('Items reversed sorted by uploadedTime', () => {
    const sortedData = GenericSort(unsortedMockFileInfo, 'uploadedTime', true);
    expect(getIdsFromFileInfo(sortedData)).toStrictEqual(sortedIdsReversed);
  });
});
