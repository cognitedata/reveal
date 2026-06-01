import { Mock } from 'moq.ts';
import { Cdf360ImageAnnotationCache } from './Cdf360ImageAnnotationCache';
import { AnnotationsAPI, CogniteClient } from '@cognite/sdk';
import { InstanceReference } from '../types';
import { ClassicDataSourceType, DMDataSourceType } from '../DataSourceType';
import { createCursorAndAsyncIterator } from '../../../../test-utilities';

import { jest } from '@jest/globals';

describe(Cdf360ImageAnnotationCache, () => {
  const CLASSIC_ID: InstanceReference<ClassicDataSourceType> = { id: 123 };
  const DM_ID: InstanceReference<DMDataSourceType> = { externalId: 'external-id', space: 'space' };

  const mockReverseLookup = jest.fn<AnnotationsAPI['reverseLookup']>();

  const mockSdk = new Mock<CogniteClient>()
    .setup(p => p.annotations.reverseLookup)
    .returns(mockReverseLookup)
    .object();

  test('caches reverse-lookup result', async () => {
    const fileResult = { items: [{ id: 987 }] };
    mockReverseLookup.mockReturnValue(createCursorAndAsyncIterator(fileResult));

    const cache = new Cdf360ImageAnnotationCache(mockSdk);

    const result0 = await cache.reverseLookup(CLASSIC_ID);
    const result1 = await cache.reverseLookup(DM_ID);

    expect(result0).toEqual(fileResult.items);
    expect(result0).toEqual(result1);
    expect(mockReverseLookup).toHaveBeenCalledTimes(1);
  });
});
