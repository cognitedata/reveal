import { renderHook, waitFor } from '@testing-library/react';
import { setupServer } from 'msw/node';

import { testQueryClientWrapper as wrapper } from '@data-exploration-lib/core';

import { getMock360Images } from '../../../__mocks/getMock360Images';
import { useInfinite360Images } from '../useInfinite360Images';

const mockServer = setupServer(getMock360Images());
describe('useInfinite360Images', () => {
  beforeAll(() => {
    mockServer.listen();
  });
  afterAll(() => {
    mockServer.close();
  });
  it('should be okay', async () => {
    const { result } = renderHook(() => useInfinite360Images(), { wrapper });

    await waitFor(() =>
      expect(result.current.images360Data).toStrictEqual(
        expect.arrayContaining([
          expect.objectContaining({
            siteId: 'helideck-site-2',
            siteName: 'Helideck Q4 2015',
          }),
        ])
      )
    );
  });
});
