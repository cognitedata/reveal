import { FileFilterProps, FileInfo, sdkv3 } from '@cognite/cdf-sdk-singleton';
import { VALID_MIME_TYPES } from 'src/constants/validMimeTypes';
import { concat, defer, from, lastValueFrom } from 'rxjs';
import { last, scan, takeWhile } from 'rxjs/operators';

const validMimeTypes = VALID_MIME_TYPES.map((mimeType) => mimeType.type);

export const searchFilesWithValidMimeTypes = async (
  filter: FileFilterProps,
  search: {
    name?: string;
  },
  limit: number
): Promise<FileInfo[]> => {
  // if user specify a mime type
  if (filter?.mimeType) {
    return sdkv3.files.search({
      filter,
      search,
      limit,
    });
  }

  // if user do not specify a mime type
  const requestObservables = validMimeTypes.map((mimeType) => {
    return defer(() =>
      from(
        sdkv3.files.search({
          filter: { ...filter, mimeType },
          search,
          limit,
        })
      )
    );
  });
  const searchResultsObs = concat(...requestObservables).pipe(
    scan((acc, res) => {
      return acc.concat(res);
    }),
    takeWhile((res) => {
      return res.length < limit;
    }, true),
    last()
  );

  const searchResults = await lastValueFrom(searchResultsObs);

  return searchResults.slice(0, limit);
};
