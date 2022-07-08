import { WELLBORE_COLORS } from 'domain/wells/wellbore/constants';
import { getMockWellbore } from 'domain/wells/wellbore/internal/__fixtures/getMockWellbore';

import { Store } from 'redux';

import { getMockWell } from '__test-utils/fixtures/well';
import { renderHookWithStore } from '__test-utils/renderer';
import { getMockedStore } from '__test-utils/store.utils';
import { WellInspectState } from 'modules/wellInspect/types';
import { useWellsByIds } from 'modules/wellSearch/hooks/useWellsCacheQuerySelectors';
import { WellboreId } from 'modules/wellSearch/types';

import { useWellInspectSelectedWellbores } from '../useWellInspectSelectedWellbores';
import { useWellInspectSelectedWells } from '../useWellInspectSelectedWells';
import { useWellInspectWells } from '../useWellInspectWells';

jest.mock('modules/wellSearch/hooks/useWellsCacheQuerySelectors', () => ({
  useWellsByIds: jest.fn(),
}));

const inspectWellId = '759155409324883';
const inspectWellboreId = '12345';
const inspectWellboreMetadata = { color: WELLBORE_COLORS[0] };

const getMockedStoreWithWellInspect = (extras?: Partial<WellInspectState>) => {
  return {
    ...getMockedStore({
      wellInspect: {
        selectedWellIds: {
          [inspectWellId]: true,
        },
        selectedWellboreIds: {
          [inspectWellboreId]: true,
        },
        ...extras,
      },
    }),
  };
};

describe('useWellInspect', () => {
  describe('useWellInspectWells', () => {
    const getHookResult = (store?: Store) => {
      const { result, waitForNextUpdate } = renderHookWithStore(
        () => useWellInspectWells(),
        store || getMockedStore()
      );
      waitForNextUpdate();
      return result.current;
    };

    it('should return an empty array when no wells', () => {
      (useWellsByIds as jest.Mock).mockImplementation(() => ({ wells: [] }));
      const { wells: inspectWells } = getHookResult();
      expect(inspectWells).toEqual([]);
    });

    it('should return an empty array for wellbores when they are undefined', () => {
      const wells = [getMockWell({ wellbores: undefined })];
      const mockStore = getMockedStoreWithWellInspect();
      (useWellsByIds as jest.Mock).mockImplementation(() => ({ wells }));

      const { wells: inspectWells } = getHookResult(mockStore);
      const expectedResult = wells.map((well) => ({
        ...well,
        wellbores: [],
      }));
      expect(inspectWells).toEqual(expectedResult);
    });

    it('should return wells and wellbores to inspect', () => {
      const inspectWellbore = getMockWellbore({ id: inspectWellboreId });
      const inspectWell = getMockWell({
        wellbores: [inspectWellbore],
      });
      const mockStore = getMockedStoreWithWellInspect();
      (useWellsByIds as jest.Mock).mockImplementation(() => ({
        wells: [inspectWell],
      }));

      const inspectWells = getHookResult(mockStore);

      expect(inspectWells).toEqual(
        expect.objectContaining({
          wells: [
            {
              ...inspectWell,
              wellbores: [{ ...inspectWellbore, ...inspectWellboreMetadata }],
            },
          ],
        })
      );
    });
  });

  describe('useWellInspectSelectedWells', () => {
    const getHookResult = (store?: Store) => {
      const { result, waitForNextUpdate } = renderHookWithStore(
        () => useWellInspectSelectedWells(),
        store || getMockedStore()
      );
      waitForNextUpdate();
      return result.current;
    };

    it('should return only selected wells and wellbores', () => {
      const inspectWellbore = getMockWellbore({ id: inspectWellboreId });
      const inspectWell = getMockWell({
        id: inspectWellId,
        wellbores: [getMockWellbore(), inspectWellbore],
      });
      const wells = [getMockWell({ id: '1234567890' }), inspectWell];
      const mockStore = getMockedStoreWithWellInspect();
      (useWellsByIds as jest.Mock).mockImplementation(() => ({ wells }));

      const selectedWells = getHookResult(mockStore);
      expect(selectedWells).toEqual([
        {
          ...inspectWell,
          wellbores: [{ ...inspectWellbore, ...inspectWellboreMetadata }],
        },
      ]);
    });
  });

  describe('useWellInspectSelectedWellbores', () => {
    const getHookResult = (store?: Store, filterByIds?: WellboreId[]) => {
      const { result, waitForNextUpdate } = renderHookWithStore(
        () => useWellInspectSelectedWellbores(filterByIds),
        store || getMockedStore()
      );
      waitForNextUpdate();
      return result.current;
    };

    it('should return only selected wellbores', () => {
      const inspectWellbore = getMockWellbore({ id: inspectWellboreId });
      const wells = [
        getMockWell({ id: '12345' }),
        getMockWell({
          id: inspectWellId,
          wellbores: [getMockWellbore(), inspectWellbore],
        }),
      ];
      const mockStore = getMockedStoreWithWellInspect();
      (useWellsByIds as jest.Mock).mockImplementation(() => ({ wells }));

      const selectedWells = getHookResult(mockStore);
      expect(selectedWells).toEqual([
        { ...inspectWellbore, ...inspectWellboreMetadata },
      ]);
    });

    it('should return only selected wellbores filtered by id', () => {
      const filterWellboreId = '0123456789';
      const inspectWellbore = getMockWellbore({ id: inspectWellboreId });
      const filterWellbore = getMockWellbore({ id: filterWellboreId });
      const wells = [
        getMockWell({ id: '12345' }),
        getMockWell({
          id: inspectWellId,
          wellbores: [getMockWellbore(), inspectWellbore, filterWellbore],
        }),
      ];
      const mockStore = getMockedStoreWithWellInspect({
        selectedWellboreIds: {
          [filterWellboreId]: true,
          [inspectWellboreId]: true,
        },
      });
      (useWellsByIds as jest.Mock).mockImplementation(() => ({ wells }));

      const selectedWells = getHookResult(mockStore, [filterWellboreId]);
      expect(selectedWells).toEqual([
        { ...filterWellbore, color: WELLBORE_COLORS[1] },
      ]);
    });
  });
});
