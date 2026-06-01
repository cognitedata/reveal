import { Mock } from 'moq.ts';
import { Cdf360ImageAnnotationCache } from './Cdf360ImageAnnotationCache';
import { CogniteClient } from '@cognite/sdk';

describe(Cdf360ImageAnnotationCache, () => {
  const mockSdk = new Mock<CogniteClient>().object();

  test('annotation cache', () => {
    const cache = new Cdf360ImageAnnotationCache(mockSdk);
  });
});
