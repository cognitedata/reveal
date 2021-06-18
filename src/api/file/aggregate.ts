import {
  FileFilterProps,
  v3Client as client,
} from '@cognite/cdf-sdk-singleton';
import { VALID_MIME_TYPES } from 'src/constants/validMimeTypes';

export const totalFileCount = async (filter: FileFilterProps) => {
  const fileCounts: number[] = [];
  const validMimeTypes = VALID_MIME_TYPES.map((mimeType) => mimeType.type);

  // if user specify a mime type
  if (filter?.mimeType) {
    const aggregates = await client.files.aggregate({
      filter,
    });
    fileCounts.push(aggregates[0].count);
  }

  // if user do not specify a mime type
  else {
    await Promise.all(
      validMimeTypes.map(async (mimeType) => {
        const aggregates = await client.files.aggregate({
          filter: { ...filter, mimeType },
        });
        fileCounts.push(aggregates[0].count);
      })
    );
  }

  return fileCounts.reduce((a, b) => a + b, 0);
};
