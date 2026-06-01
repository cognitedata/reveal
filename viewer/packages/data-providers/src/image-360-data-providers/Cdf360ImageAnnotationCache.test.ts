import { Mock } from 'moq.ts';
import { Cdf360ImageAnnotationCache } from './Cdf360ImageAnnotationCache';
import { AnnotationsAPI, CogniteClient } from '@cognite/sdk';
import { InstanceReference } from '../types';
import { ClassicDataSourceType, DMDataSourceType } from '../DataSourceType';
import { createAnnotationModel, createCursorAndAsyncIterator } from '../../../../test-utilities';

describe(Cdf360ImageAnnotationCache, () => {
  const CLASSIC_ID: InstanceReference<ClassicDataSourceType> = { id: 123 };
  const DM_ID: InstanceReference<DMDataSourceType> = { externalId: 'external-id', space: 'space' };

  const mockReverseLookup = vi.fn<AnnotationsAPI['reverseLookup']>();
  const mockAnnotationList = vi.fn<AnnotationsAPI['list']>();

  const mockSdk = new Mock<CogniteClient>()
    .setup(p => p.annotations.reverseLookup)
    .returns(mockReverseLookup)
    .setup(p => p.annotations.list)
    .returns(mockAnnotationList)
    .object();

  test('caches reverse-lookup result', async () => {
    const fileResult = { items: [{ id: 987 }] };
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
});
