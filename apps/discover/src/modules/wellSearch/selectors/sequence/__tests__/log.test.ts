import { useSelector } from 'react-redux';

import { act } from '@testing-library/react';
import { renderHook } from '@testing-library/react-hooks';

import { mockedWellStateWithSelectedWells } from '__test-utils/fixtures/well';

import { useLogTypes } from '../log';

jest.mock('react-redux', () => ({
  useSelector: jest.fn(),
  useDispatch: jest.fn(),
}));
jest.mock('react-query', () => ({
  useQueryClient: () => ({
    setQueryData: jest.fn(),
  }),
  useQuery: () => ({ isLoading: false, error: {}, data: [] }),
}));

describe('log hook', () => {
  test('check for empty data', async () => {
    (useSelector as jest.Mock).mockImplementation((callback) => {
      return callback(mockedWellStateWithSelectedWells);
    });
    const { result, waitForNextUpdate } = renderHook(() => useLogTypes());
    act(() => {
      waitForNextUpdate();
    });
    const data = result.current;
    expect(data).toEqual([]);
  });

  test('check for log data', async () => {
    (useSelector as jest.Mock).mockImplementation((callback) => {
      return callback({
        wellSearch: {
          ...mockedWellStateWithSelectedWells.wellSearch,
          wellboreData: {
            759155409324993: {
              logType: [
                {
                  sequence: {
                    columns: [
                      {
                        valueType: 'STRING',
                        externalId: '1234',
                      },
                    ],
                  },
                },
              ],
              ppfg: [],
            },
          },
        },
      });
    });
    const { result, waitForNextUpdate } = renderHook(() => useLogTypes());
    act(() => {
      waitForNextUpdate();
    });
    const data = result.current;
    expect(data[0].logType).toEqual('logType');
    expect(data[0].wellName).toEqual('16/1');
    expect(data[0].wellboreName).toEqual('wellbore A desc');
  });
});
