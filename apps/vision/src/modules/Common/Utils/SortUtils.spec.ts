import {
  mockFileIds,
  mockFileInfo,
} from '../../../__test-utils/data/mockFileInfo';
import { getIdsFromFileInfo } from '../../../__test-utils/getIdsFromFileInfo';
import { shuffle } from '../../../__test-utils/shuffle';

import { GenericSort } from './SortUtils';

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
