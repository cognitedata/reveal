import { GenericSort } from 'src/modules/Common/Utils/SortUtils';
import { mockFileInfo } from 'src/__test-utils/data/mockFileInfo';
import { getIdsFromFileInfo } from 'src/__test-utils/getIdsFromFileInfo';
import { shuffle } from 'src/__test-utils/shuffle';

const unsortedmockFileInfo = shuffle(mockFileInfo);

const sortedIds = [1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11, 12];
const sortedIdsReversed = [...sortedIds].reverse();

describe('Testing GenericSort fn', () => {
  it('Items sorted by createdTime', () => {
    const sortedData = GenericSort(unsortedmockFileInfo, 'createdTime', false);
    expect(getIdsFromFileInfo(sortedData)).toStrictEqual(sortedIds);
  });
  it('Items reversed sorted by createdTime', () => {
    const sortedData = GenericSort(unsortedmockFileInfo, 'createdTime', true);
    expect(getIdsFromFileInfo(sortedData)).toStrictEqual(sortedIdsReversed);
  });
  it('Items sorted by uploadedTime', () => {
    const sortedData = GenericSort(unsortedmockFileInfo, 'uploadedTime', false);
    expect(getIdsFromFileInfo(sortedData)).toStrictEqual(sortedIds);
  });
  it('Items reversed sorted by uploadedTime', () => {
    const sortedData = GenericSort(unsortedmockFileInfo, 'uploadedTime', true);
    expect(getIdsFromFileInfo(sortedData)).toStrictEqual(sortedIdsReversed);
  });
});
