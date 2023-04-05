import { getAssetsAggregate } from '../getAssetsAggregate';

import { setupServer } from 'msw/node';
import { renderHook } from '@testing-library/react-hooks';

import { getMockAssetsAggregatePost } from '../../../service/__mocks';

import { mockCogniteClient } from '../../../../__mocks';
import { getAssetsMetadataValues } from '../../__fixtures/getAssetsMetadataValuesFixture';

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
