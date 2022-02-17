import { QueryClient } from 'react-query';

import { screen } from '@testing-library/react';
import { setupServer } from 'msw/node';
import { getMockConfigGet } from 'services/projectConfig/__mocks/getMockConfigGet';
import { getMockWellsById } from 'services/well/__mocks/getMockWellsById';

import { testRendererForHooks } from '__test-utils/renderer';
import { WELL_QUERY_KEY } from 'constants/react-query';
import { setEnableWellSDKV3 } from 'modules/wellSearch/sdk';

import { useWellsCacheQuery } from '../useWellsCacheQuery';

const mockServer = setupServer(getMockWellsById(), getMockConfigGet());

describe('useWellsCacheQuery', () => {
  beforeAll(() => mockServer.listen());
  afterAll(() => mockServer.close());

  const queryClient = new QueryClient();

  it('should return correct wells after cache changes', async () => {
    setEnableWellSDKV3();

    const Component = () => {
      const { data, isLoading } = useWellsCacheQuery(['test-well-1']);

      return (
        <>
          <div>{`data: ${data && data[0].id}`}</div>
          <div>{`isLoading: ${isLoading ? 'yes' : 'no'}`}</div>
        </>
      );
    };

    testRendererForHooks(Component, queryClient);

    expect(await screen.findByText('isLoading: no')).toBeInTheDocument();
    expect(await screen.findByText('data: test-well-1')).toBeInTheDocument();

    const ComponentTwo = () => {
      const { data, isLoading } = useWellsCacheQuery(['test-well-2']);

      return (
        <>
          <div>{`data: ${data && data[0].id}`}</div>
          <div>{`isLoading: ${isLoading ? 'yes' : 'no'}`}</div>
        </>
      );
    };

    testRendererForHooks(ComponentTwo, queryClient);

    expect(await screen.findByText('isLoading: no')).toBeInTheDocument();
    // still only return the one requested well
    expect(await screen.findByText('data: test-well-2')).toBeInTheDocument();

    // but confirm that we have now cached both:
    const cachedWells =
      queryClient.getQueryData<unknown[]>(WELL_QUERY_KEY.WELLS_CACHE) || [];
    expect(cachedWells.length).toEqual(2);
  });
});
