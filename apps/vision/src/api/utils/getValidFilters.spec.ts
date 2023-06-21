import { getValidFilters } from '@vision/api/utils/getValidFilters';
import { timeFormat } from '@vision/modules/FilterSidePanel/Components/Filters/TimeFilter';
import { VisionFileFilterProps } from '@vision/modules/FilterSidePanel/types';
import moment from 'moment';

import { DateRange, FileFilterProps } from '@cognite/sdk';

const dummyTimeRange: DateRange = {
  min: moment('6:00 AM', timeFormat).valueOf(),
  max: moment('6:00 PM', timeFormat).valueOf(),
};
const dummyFileFilterProps: FileFilterProps = {
  name: 'dummyName',
  mimeType: 'jpg',
  metadata: { key: 'value' },
  assetIds: [1],
  rootAssetIds: [
    {
      id: 1,
    },
  ],
  dataSetIds: [
    {
      id: 1,
    },
  ],
  assetSubtreeIds: [
    {
      id: 1,
    },
  ],
  directoryPrefix: 'dummyPrefix',
  source: 'dummySource',
  createdTime: dummyTimeRange,
  lastUpdatedTime: dummyTimeRange,
  uploadedTime: dummyTimeRange,
  sourceCreatedTime: dummyTimeRange,
  sourceModifiedTime: dummyTimeRange,
  externalIdPrefix: 'dummyPrefix',
  uploaded: true,
  labels: {
    containsAny: [
      {
        externalId: '1',
      },
    ],
  },
};
const dummyVisionFileFilterProps: VisionFileFilterProps = {
  ...dummyFileFilterProps,
  newVisionFilterProperty: true,
} as VisionFileFilterProps;

describe('Testing getValidFilters fn', () => {
  it('Function should filter out additional filter properties', () => {
    expect(getValidFilters(dummyVisionFileFilterProps)).not.toEqual(
      expect.objectContaining({
        newVisionFilterProperty: true,
      })
    );
  });
  it('Function should not filter out valid filter properties', () => {
    expect(getValidFilters(dummyVisionFileFilterProps)).toEqual(
      expect.objectContaining(dummyFileFilterProps)
    );
  });
});
