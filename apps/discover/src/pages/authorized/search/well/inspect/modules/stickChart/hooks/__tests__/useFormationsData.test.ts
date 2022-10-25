import '__mocks/mockContainerAuth'; // should be first
import 'domain/wells/__mocks/setupWellsMockSDK';
import { getMockConfigGet } from 'domain/projectConfig/service/__mocks/getMockConfigGet';
import { getMockUserMe } from 'domain/userManagementService/service/__mocks/getMockUserMe';
import { getMockTrajectoriesList } from 'domain/wells/trajectory/service/__mocks/getMockWellTrajectories';
import { getMockWellsById } from 'domain/wells/well/service/__mocks/getMockWellsById';
import { getMockWellTopsById } from 'domain/wells/wellTops/service/__mocks/getMockWellTops';

import { renderHook } from '@testing-library/react-hooks';
import isEmpty from 'lodash/isEmpty';
import { setupServer } from 'msw/node';

import { getWrapper } from '__test-utils/renderer';
import { getMockedStore } from '__test-utils/store.utils';
import { AppStore } from '__test-utils/types';

import { useFormationsData } from '../useFormationsData';

const mockServer = setupServer();

describe('useFormationsData', () => {
  beforeAll(() => mockServer.listen());
  beforeEach(() => mockServer.resetHandlers());
  afterAll(() => mockServer.close());

  it('should return data', async () => {
    mockServer.use(
      getMockUserMe(),
      getMockConfigGet(),
      getMockWellsById(),
      getMockWellTopsById(),
      getMockTrajectoriesList()
    );
    const store: AppStore = getMockedStore({
      wellInspect: {
        selectedWellIds: {
          'test-well-1': true,
        },
        selectedWellboreIds: {
          'test-wellbore-1': true,
        },
      },
    });
    const { result, waitFor } = await renderHook(() => useFormationsData(), {
      wrapper: getWrapper(store),
    });

    await waitFor(() => !isEmpty(result.current.data));
    expect(result.current.data['test-wellbore-1']).toEqual(
      expect.arrayContaining([
        expect.objectContaining({
          name: 'T98 - Top Stronsay',
          color: '#EB9B00',
          wellboreMatchingId: 'test-wellbore-1',
          depthUnit: 'm',
          isComputedBase: false,
        }),
      ])
    );
  });

  /**
   * Flaky.
   */
  // eslint-disable-next-line jest/no-disabled-tests
  it.skip('should not throw error when trajectory request fails', async () => {
    mockServer.use(
      getMockUserMe(),
      getMockConfigGet(),
      getMockWellsById(),
      getMockWellTopsById(),
      getMockTrajectoriesList([])
    );
    const store: AppStore = getMockedStore({
      wellInspect: {
        selectedWellIds: {
          'test-well-1': true,
        },
        selectedWellboreIds: {
          'test-wellbore-1': true,
        },
      },
    });
    const { result, waitForNextUpdate } = await renderHook(
      () => useFormationsData(),
      {
        wrapper: getWrapper(store),
      }
    );
    await waitForNextUpdate();
    expect(result.current.data['test-wellbore-1']).toBe(undefined);
  });
});
