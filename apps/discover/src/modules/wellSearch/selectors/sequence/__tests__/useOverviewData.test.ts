import { useSelector } from 'react-redux';

import { renderHook } from '@testing-library/react-hooks';
import { act } from 'react-dom/test-utils';

import { mockedWellStateWithSelectedWells } from '__test-utils/fixtures/well';
import { OverviewModel } from 'pages/authorized/search/well/inspect/modules/overview/types';

import { useOverviewData } from '../useOverviewData';

jest.mock('react-query', () => ({
  useQueryClient: () => ({
    setQueryData: jest.fn(),
  }),
  useQuery: () => ({ isLoading: false, error: {}, data: [] }),
}));

jest.mock('react-redux', () => ({
  useSelector: jest.fn(),
  useDispatch: jest.fn(),
}));

jest.mock('../../../hooks/useTrajectoriesQuery', () => ({
  useTrajectoriesQuery: () => ({ isLoading: true, trajectories: [] }),
}));

describe('Overview hook', () => {
  beforeEach(() => {
    (useSelector as jest.Mock).mockImplementation((callback) => {
      return callback(mockedWellStateWithSelectedWells);
    });
  });
  afterEach(() => {
    (useSelector as jest.Mock).mockClear();
  });

  test('load overview data', async () => {
    const { result, waitForNextUpdate } = renderHook(() => useOverviewData());
    act(() => {
      waitForNextUpdate();
    });
    const overviewData: OverviewModel = result.current.overviewData[0];

    expect(overviewData.wellId).toEqual(1234);
    expect(overviewData.name).toEqual('wellbore A');
    // check for rounded decimal points
    expect(overviewData.waterDepth?.value).toEqual('23.52');
  });
});
