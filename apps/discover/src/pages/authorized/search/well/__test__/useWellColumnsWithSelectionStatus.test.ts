import { renderHook } from '@testing-library/react-hooks';

import { testWrapper, getWrapper } from '__test-utils/renderer';
import { getMockedStore } from '__test-utils/store.utils';
import { initialState } from 'modules/wellSearch/reducer';

import { useWellColumnsWithSelectionStatus } from '../useWellColumnsWithSelectionStatus';

describe('useWellColumnsWithSelectionStatus', () => {
  const testColumn = {
    Header: 'test',
    accessor: '',
    width: '1',
  };

  it('Well column should contain selection status', async () => {
    const { result } = renderHook(
      () =>
        useWellColumnsWithSelectionStatus({
          fieldname: testColumn,
        }),
      { wrapper: testWrapper }
    );
    expect(result.current).toEqual({
      fieldname: { ...testColumn, selected: false },
    });
  });
  it('Well column should contain selection status: enabled', async () => {
    const { result } = renderHook(
      () =>
        useWellColumnsWithSelectionStatus({
          fieldname: testColumn,
        }),
      {
        wrapper: getWrapper(
          getMockedStore({
            wellSearch: {
              ...initialState,
              selectedColumns: ['fieldname'],
            },
          })
        ),
      }
    );
    expect(result.current).toEqual({
      fieldname: { ...testColumn, selected: true },
    });
  });
});
