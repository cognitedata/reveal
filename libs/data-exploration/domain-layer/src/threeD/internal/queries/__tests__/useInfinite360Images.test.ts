import { setupServer } from 'msw/node';
import { renderHook } from '@testing-library/react-hooks';
import { testQueryClientWrapper as wrapper } from '@data-exploration-lib/core';
import { getMock360Images } from '../../../__mocks/getMock360Images';
import { useInfinite360Images } from '@data-exploration-lib/domain-layer';

const mockServer = setupServer(getMock360Images());
describe('useInfinite360Images', () => {
  beforeAll(() => {
    mockServer.listen();
  });
  afterAll(() => {
    mockServer.close();
  });
  it('should be okay', async () => {
    const { result, waitForNextUpdate } = renderHook(
      () => useInfinite360Images(),
      { wrapper }
    );

    await waitForNextUpdate();

    expect(result.current.images360Data).toStrictEqual(
      expect.arrayContaining([
        expect.objectContaining({
          siteId: 'helideck-site-2',
          siteName: 'Helideck Q4 2015',
        }),
      ])
    );
  });
});
