import { renderHook } from '@testing-library/react-hooks';
import { act } from 'react-dom/test-utils';

import { useGeomechanicsFilterOptions } from '../measurements/v2/useGeomechanicsFilterOptions';

jest.mock('react-redux', () => ({
  useSelector: jest.fn(),
}));

jest.mock('modules/wellSearch/hooks/useMeasurementsQuery', () => ({
  useMeasurementsQuery: () => ({
    data: {
      123123213: [
        {
          metadata: { dataType: 'geomechanic' },
          columns: [{ name: 'SHMAX_MAGNITUDE_PRE' }],
        },
      ],
      2435434: [
        {
          metadata: { dataType: 'geomechanic' },
          columns: [{ name: 'SHMIN_SAND_ML_PRE' }],
        },
      ],
    },
  }),
}));

describe('useGeomechanicsFilterOptions hook', () => {
  test('should return geomechanics filter options', async () => {
    const { result, waitForNextUpdate } = renderHook(() =>
      useGeomechanicsFilterOptions()
    );
    act(() => {
      waitForNextUpdate();
    });
    expect(result.current).toEqual({
      curves: ['SHMAX_MAGNITUDE_PRE', 'SHMIN_SAND_ML_PRE'],
    });
  });
});
