import { FileFilterProps, FileInfo, sdkv3 } from '@cognite/cdf-sdk-singleton';
import { VALID_MIME_TYPES } from 'src/constants/validMimeTypes';

const validMimeTypes = VALID_MIME_TYPES.map((mimeType) => mimeType.type);

export const searchFilesWithValidMimeTypes = async (
  filter?: FileFilterProps,
  search?: {
    name?: string;
  },
  limit?: number
): Promise<FileInfo[]> => {
  const serchResults: FileInfo[] = [];

  // if user specify a mime type
  if (filter?.mimeType) {
    return sdkv3.files.search({
      filter,
      search,
      limit,
    });
  }

  // if user do not specify a mime type
  await Promise.all(
    validMimeTypes.map(async (mimeType) => {
      const fileSearchResult = await sdkv3.files.search({
        filter: { ...filter, mimeType },
        search,
        limit,
      });
      serchResults.push(...fileSearchResult);
    })
  );
  return serchResults.slice(0, limit);
};
