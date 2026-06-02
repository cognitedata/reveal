/*!
 * Copyright 2026 Cognite AS
 */
import { Mock } from 'moq.ts';
import { Cdf360ImageAnnotationCache } from './Cdf360ImageAnnotationCache';
import { AnnotationsAPI, CogniteClient, FilesAPI } from '@cognite/sdk';
import { InstanceReference } from '../types';
import { ClassicDataSourceType } from '../DataSourceType';
import { createAnnotationModel, createCursorAndAsyncIterator } from '../../../../test-utilities';
import { createFileInfo } from '../../../../test-utilities/src/createFileInfo';

describe(Cdf360ImageAnnotationCache, () => {
  const CLASSIC_ID: InstanceReference<ClassicDataSourceType> = { id: 123 };

  const FILE_ID = { id: 987 };

  const mockReverseLookup = vi.fn<AnnotationsAPI['reverseLookup']>();
  const mockAnnotationList = vi.fn<AnnotationsAPI['list']>();
  const mockFileRetrieve = vi.fn<FilesAPI['retrieve']>();

  const mockSdk = new Mock<CogniteClient>()
    .setup(p => p.annotations.reverseLookup)
    .returns(mockReverseLookup)
    .setup(p => p.annotations.list)
    .returns(mockAnnotationList)
    .setup(p => p.files.retrieve)
    .returns(mockFileRetrieve)
    .object();

  beforeEach(() => {
    vi.resetAllMocks();
  });

  test('caches reverse-lookup result', async () => {
    const fileResult = { items: [FILE_ID] };
    const resultAnnotations = { items: [createAnnotationModel({})] };
    mockReverseLookup.mockReturnValue(createCursorAndAsyncIterator(fileResult));
    mockAnnotationList.mockReturnValue(createCursorAndAsyncIterator(resultAnnotations));

    const cache = new Cdf360ImageAnnotationCache(mockSdk);

    const result0 = await cache.reverseLookup(CLASSIC_ID);
    const result1 = await cache.reverseLookup(CLASSIC_ID);

    expect(result0).toEqual(resultAnnotations.items);
    expect(result0).toEqual(result1);
    expect(mockReverseLookup).toHaveBeenCalledExactlyOnceWith({
      filter: {
        annotatedResourceType: 'file',
        annotationType: 'images.AssetLink',
        data: { assetRef: CLASSIC_ID }
      },
      limit: 1000
    });
    expect(mockAnnotationList).toHaveBeenCalledExactlyOnceWith({
      filter: { annotatedResourceIds: fileResult.items, annotatedResourceType: 'file' },
      limit: 1000
    });
  });

  test('caches get-annotations-for-files result', async () => {
    const resultAnnotations = { items: [createAnnotationModel({ annotatedResourceId: FILE_ID.id })] };
    mockAnnotationList.mockReturnValue(createCursorAndAsyncIterator(resultAnnotations));

    const cache = new Cdf360ImageAnnotationCache(mockSdk);

    const result0 = await cache.getAnnotationsForFiles([FILE_ID]);
    const result1 = await cache.getAnnotationsForFiles([FILE_ID]);

    expect(result0).toEqual(resultAnnotations.items);
    expect(result0).toEqual(result1);
    expect(mockAnnotationList).toHaveBeenCalledExactlyOnceWith({
      filter: { annotatedResourceIds: [FILE_ID], annotatedResourceType: 'file' },
      limit: 1000
    });
  });

  test('caches get-file-infos-for-file-ids result', async () => {
    const resultFiles = [createFileInfo(FILE_ID)];
    mockFileRetrieve.mockResolvedValue(resultFiles);

    const cache = new Cdf360ImageAnnotationCache(mockSdk);

    const result0 = await cache.getFileInfosForFileIds([FILE_ID]);
    const result1 = await cache.getFileInfosForFileIds([FILE_ID]);

    expect(result0).toEqual(resultFiles);
    expect(result1).toEqual(result1);

    expect(mockFileRetrieve).toHaveBeenCalledExactlyOnceWith([FILE_ID]);
  });
});
