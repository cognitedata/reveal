import { renderHook } from '@testing-library/react-hooks';
import { setupServer } from 'msw/node';

import { mockCogniteClient } from '../../../../__mocks';
import { getMockAssetsAggregatePost } from '../../../service/__mocks';
import { getAssetsMetadataValues } from '../../__fixtures/getAssetsMetadataValuesFixture';
import { getAssetsAggregate } from '../getAssetsAggregate';

const testData = getAssetsMetadataValues();
const mockServer = setupServer(getMockAssetsAggregatePost());
describe('getAssetsAggregate', () => {
  beforeAll(() => {
    mockServer.listen();
  });
  afterAll(() => {
    mockServer.close();
  });
  it('should be okay', async () => {
    const { result } = renderHook(() => getAssetsAggregate(mockCogniteClient));

    expect(await (await result.current).items).toStrictEqual(testData);
  });
});
