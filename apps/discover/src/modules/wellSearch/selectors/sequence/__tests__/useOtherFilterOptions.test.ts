import { renderHook } from '@testing-library/react-hooks';
import { act } from 'react-dom/test-utils';

import { useOtherFilterOptions } from '../measurements/v2/useOtherFilterOptions';

jest.mock('react-redux', () => ({
  useSelector: jest.fn(),
}));

jest.mock('modules/wellSearch/hooks/useMeasurementsQuery', () => ({
  useMeasurementsQuery: () => ({
    data: {
      123123213: [
        {
          metadata: { dataType: 'fit' },
        },
      ],
      2435434: [
        {
          metadata: { dataType: 'lot' },
        },
      ],
    },
  }),
}));

describe('useOtherFilterOptions hook', () => {
  test('should return other filter options', async () => {
    const { result, waitForNextUpdate } = renderHook(() =>
      useOtherFilterOptions()
    );
    act(() => {
      waitForNextUpdate();
    });
    expect(result.current).toEqual({
      types: ['LOT', 'FIT'],
    });
  });
});
