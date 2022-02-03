import { FileInfo } from '@cognite/sdk';
import sdk from '@cognite/cdf-sdk-singleton';
import { lastValueFrom, of, Subject } from 'rxjs';
import { expand, finalize, takeUntil, takeWhile, tap } from 'rxjs/operators';
import { VisionFileFilterProps } from 'src/modules/FilterSidePanel/types';
import { totalFileCount } from 'src/api/file/aggregate';
import { fileFilterByAnnotation } from 'src/api/annotation/fileFilterByAnnotation';
import { filterByTime } from 'src/api/file/fetchFiles/filterByTimeUtils';
import { getValidMimeTypesByMediaType } from 'src/api/file/fetchFiles/mimeTypeUtils';
import { getValidFilters } from 'src/api/utils/getValidFilters';

const requestCancelSubject: Subject<boolean> = new Subject<boolean>();
export const cancelFetch = () => {
  if (requestCancelSubject) requestCancelSubject.next(true);
};

export const fetchFiles = async (
  visionFilter: VisionFileFilterProps,
  search: {
    name?: string;
  },
  limit: number,
  handleSetIsLoading: (loading: boolean) => void,
  handleSetPercentageScanned: (percentComplete: number) => void
): Promise<FileInfo[]> => {
  const validFilters = getValidFilters(visionFilter);
  const { annotation, timeRange, mimeType, mediaType } = visionFilter;

  const mimeTypes = mimeType
    ? [mimeType]
    : getValidMimeTypesByMediaType(mediaType);

  const totalCount = await totalFileCount(validFilters);

  // isLoading should be true after totalFileCount finished to avoid showing wrong percentage
  handleSetIsLoading(true);

  const fileList = of({
    items: [],
    mimeTypeIndex: 0,
    nextCursor: '',
    scannedCount: 0,
  }).pipe(
    expand(async (data) => {
      let newItems;
      let nextCursor;
      let filteredItems: FileInfo[] = [];

      if (search.name) {
        newItems = await sdk.files.search({
          filter: { ...validFilters, mimeType: mimeTypes[data.mimeTypeIndex] },
          search,
        });
      } else {
        ({ items: newItems, nextCursor } = await sdk.files.list({
          filter: { ...validFilters, mimeType: mimeTypes[data.mimeTypeIndex] },
          limit: limit < 1000 ? limit : 1000,
          cursor: data.nextCursor,
        }));
      }

      filteredItems = newItems;

      if (timeRange) {
        // apply time range filter first because it is faster
        filteredItems = filterByTime(visionFilter, filteredItems);
      }
      if (annotation) {
        filteredItems = await fileFilterByAnnotation(annotation, filteredItems);
      }

      return {
        items: [...data.items, ...filteredItems],
        mimeTypeIndex: nextCursor ? data.mimeTypeIndex : data.mimeTypeIndex + 1,
        nextCursor,
        scannedCount: data.scannedCount + newItems.length,
      };
    }),
    tap((results) => {
      // if totalFileCount returns 0 no results will be displayed and percentageScanned will be set to 100
      const percentageScanned =
        totalCount === 0 ? 100 : (results.scannedCount * 100) / totalCount;
      handleSetPercentageScanned(percentageScanned);
    }),
    takeWhile(
      (res) => res.items.length < limit && res.mimeTypeIndex < mimeTypes.length,
      true
    ),
    takeUntil(requestCancelSubject),
    finalize(() => {
      handleSetIsLoading(false);
    })
  );

  // todo: totalCount and fileList can be run together instead of waiting for totalCount request
  const searchResults = await lastValueFrom(fileList);
  return searchResults.items.slice(0, limit);
};
