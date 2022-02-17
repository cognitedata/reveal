import { renderHook } from '@testing-library/react-hooks';
import { act } from 'react-dom/test-utils';

import { usePPFGFilterOptions } from '../measurements/v2/usePPFGFilterOptions';

jest.mock('react-redux', () => ({
  useSelector: jest.fn(),
}));

jest.mock('modules/wellSearch/hooks/useMeasurementsQuery', () => ({
  useMeasurementsQuery: () => ({
    data: {
      123123213: [
        {
          metadata: { dataType: 'ppfg' },
          columns: [{ name: 'SVERTICAL_POST' }],
        },
      ],
      2435434: [
        {
          metadata: { dataType: 'ppfg' },
          columns: [{ name: 'PP_COMPOSITE_LOW' }],
        },
      ],
    },
  }),
}));

describe('usePPFGFilterOptions hook', () => {
  test('should return ppfg filter options', async () => {
    const { result, waitForNextUpdate } = renderHook(() =>
      usePPFGFilterOptions()
    );
    act(() => {
      waitForNextUpdate();
    });
    expect(result.current).toEqual({
      curves: ['PP_COMPOSITE_LOW', 'SVERTICAL_POST'],
    });
  });
});
