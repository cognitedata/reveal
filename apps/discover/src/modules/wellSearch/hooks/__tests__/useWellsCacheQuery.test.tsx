import 'domain/wells/__mocks/setupWellsMockSDK';
import { getMockWellsById } from 'domain/wells/well/service/__mocks/getMockWellsById';

import { QueryClient, useQueryClient } from 'react-query';

import { screen } from '@testing-library/react';
import { setupServer } from 'msw/node';
import { getMockConfigGet } from 'services/projectConfig/__mocks/getMockConfigGet';

import { testRendererForHooks } from '__test-utils/renderer';
import { WELL_QUERY_KEY } from 'constants/react-query';

import { useWellsCacheQuery } from '../useWellsCacheQuery';

const mockServer = setupServer(getMockWellsById(), getMockConfigGet());

describe('useWellsCacheQuery', () => {
  beforeAll(() => mockServer.listen());
  afterAll(() => mockServer.close());

  // INFO: we need the same instance in this test, otherwise avoid creating new QueryClients
  const queryClient = new QueryClient({
    defaultOptions: {
      queries: {
        retry: false,
      },
    },
  });

  it('should return correct wells after cache changes', async () => {
    const Component = () => {
      const { data, isLoading } = useWellsCacheQuery(['test-well-1']);

      return (
        <>
          <div>{`data: ${data && data.wells[0].id}`}</div>
          <div>{`isLoading: ${isLoading ? 'yes' : 'no'}`}</div>
        </>
      );
    };

    testRendererForHooks(Component, {}, queryClient);

    expect(await screen.findByText('isLoading: no')).toBeInTheDocument();
    expect(await screen.findByText('data: test-well-1')).toBeInTheDocument();

    const ComponentTwo = () => {
      const { data, isLoading } = useWellsCacheQuery(['test-well-2']);
      const cachedWells =
        useQueryClient().getQueryData<unknown[]>(WELL_QUERY_KEY.WELLS_CACHE) ||
        [];

      return (
        <>
          <div>{`data: ${data && data.wells[0].id}`}</div>
          <div>{`isLoading: ${isLoading ? 'yes' : 'no'}`}</div>
          <div>{`cached wells: ${cachedWells.length}`}</div>
        </>
      );
    };

    testRendererForHooks(ComponentTwo, {}, queryClient);

    expect(await screen.findByText('isLoading: no')).toBeInTheDocument();
    // still only return the one requested well
    expect(await screen.findByText('data: test-well-2')).toBeInTheDocument();

    // but confirm that we have now cached both:
    expect(await screen.findByText('cached wells: 2')).toBeInTheDocument();
  });
});
