import { FileInfo, sdkv3 } from '@cognite/cdf-sdk-singleton';
import { lastValueFrom, of, Subject } from 'rxjs';
import { expand, finalize, takeUntil, takeWhile, tap } from 'rxjs/operators';
import { VALID_MIME_TYPES } from 'src/constants/validMimeTypes';
import { VisionFileFilterProps } from 'src/modules/Explorer/Components/Filters/types';
import { totalFileCount } from 'src/api/file/aggregate';
import { fileFilterByAnnotation } from 'src/api/annotation/fileFilterByAnnotation';
import { filterByTime } from './filterByTimeUtils';

const requestCancelSubject: Subject<boolean> = new Subject<boolean>();
export const cancelFetch = () => {
  if (requestCancelSubject) requestCancelSubject.next(true);
};

const validMimeTypes = VALID_MIME_TYPES.map((mimeType) => mimeType.type);

export const fetchFiles = async (
  visionFilter: VisionFileFilterProps,
  search: {
    name?: string;
  },
  limit: number,
  handleSetIsLoading: (loading: boolean) => void,
  handleSetPercentageScanned: (percentComplete: number) => void
): Promise<FileInfo[]> => {
  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  const { annotation, mimeType, dateFilter, timeRange, ...filter } =
    visionFilter;
  // ToDo: add a validator to make sure that provided mimetype is valid
  const mimeTypes = mimeType ? [mimeType] : validMimeTypes;

  const totalCount = await totalFileCount(filter);

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

      if (search.name) {
        newItems = await sdkv3.files.search({
          filter: { ...filter, mimeType: mimeTypes[data.mimeTypeIndex] },
          search,
        });
      } else {
        ({ items: newItems, nextCursor } = await sdkv3.files.list({
          filter: { ...filter, mimeType: mimeTypes[data.mimeTypeIndex] },
          limit: limit < 1000 ? limit : 1000,
          cursor: data.nextCursor,
        }));
      }

      if (annotation) {
        newItems = await fileFilterByAnnotation(annotation, newItems);
      }
      if (timeRange) {
        newItems = filterByTime(visionFilter, newItems);
      }

      return {
        items: [...data.items, ...newItems],
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
