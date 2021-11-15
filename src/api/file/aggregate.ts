import { v3Client as client } from '@cognite/cdf-sdk-singleton';
import { VALID_MIME_TYPES } from 'src/constants/validMimeTypes';
import { VisionFileFilterProps } from 'src/modules/Explorer/Components/Filters/types';

export const totalFileCount = async (visionFilter: VisionFileFilterProps) => {
  const fileCounts: number[] = [];
  const validMimeTypes = VALID_MIME_TYPES.map((mimeType) => mimeType.type);

  // remove additional VisionFileFilters to get FileFilterProps type filter for list request. (except directoryPrefix)
  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  const { annotation, dateFilter, timeRange, ...validFilters } = visionFilter;

  // if user specify a mime type
  if (validFilters?.mimeType) {
    const aggregates = await client.files.aggregate({
      filter: validFilters,
    });
    fileCounts.push(aggregates[0].count);
  }

  // if user do not specify a mime type
  else {
    await Promise.all(
      validMimeTypes.map(async (mimeType) => {
        const aggregates = await client.files.aggregate({
          filter: { ...validFilters, mimeType },
        });
        fileCounts.push(aggregates[0].count);
      })
    );
  }

  return fileCounts.reduce((a, b) => a + b, 0);
};
