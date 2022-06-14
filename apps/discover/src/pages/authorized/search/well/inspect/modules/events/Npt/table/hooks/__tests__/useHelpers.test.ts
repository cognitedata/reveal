import '__mocks/mockContainerAuth'; // should be first
import { getMockConfigGet } from 'domain/projectConfig/service/__mocks/getMockConfigGet';
import { getMockUserMe } from 'domain/userManagementService/service/__mocks/getMockUserMe';
import { getMockWellLegendGet } from 'domain/wells/legend/service/__mocks/getMockWellLegendGet';

import { setupServer } from 'msw/node';

import { renderHookWithStore } from '__test-utils/renderer';

import {
  useNptTableCommonHeaders,
  useNptWellboresTableColumns,
  useNptEventsTableColumns,
  useSelectedWellboreNptEventsTableColumns,
} from '../useHelpers';

const mockServer = setupServer(
  getMockConfigGet(),
  getMockUserMe(),
  getMockWellLegendGet()
);

describe('useHelpers', () => {
  beforeAll(() => mockServer.listen());
  afterAll(() => mockServer.close());
  describe('useNptTableCommonHeaders hook', () => {
    const getHookResult = async () => {
      const { result, waitForNextUpdate } = renderHookWithStore(() =>
        useNptTableCommonHeaders()
      );
      waitForNextUpdate();
      return result.current;
    };

    it('should return well result head object with preferred unit', async () => {
      const ndsColumnHeaders = await getHookResult();
      expect(ndsColumnHeaders).toEqual(
        expect.arrayContaining([
          expect.objectContaining({ Header: 'NPT MD (ft)' }),
        ])
      );
    });
  });

  describe('useNptWellboresTableColumns hook', () => {
    const getHookResult = async () => {
      const { result, waitForNextUpdate } = renderHookWithStore(() =>
        useNptWellboresTableColumns()
      );
      waitForNextUpdate();
      return result.current;
    };

    it('should return well result head object with preferred unit', async () => {
      const ndsColumnHeaders = await getHookResult();
      expect(ndsColumnHeaders).toEqual(
        expect.arrayContaining([
          expect.objectContaining({ Header: 'NPT MD (ft)' }),
        ])
      );
    });
  });

  describe('useNptEventsTableColumns hook', () => {
    const getHookResult = async () => {
      const { result, waitForNextUpdate } = renderHookWithStore(() =>
        useNptEventsTableColumns()
      );
      waitForNextUpdate();
      return result.current;
    };

    it('should return well result head object with preferred unit', async () => {
      const ndsColumnHeaders = await getHookResult();
      expect(ndsColumnHeaders).toEqual(
        expect.arrayContaining([
          expect.objectContaining({ Header: 'NPT MD (ft)' }),
        ])
      );
    });
  });

  describe('useSelectedWellboreNptEventsTableColumns hook', () => {
    const getHookResult = async () => {
      const { result, waitForNextUpdate } = renderHookWithStore(() =>
        useSelectedWellboreNptEventsTableColumns()
      );
      waitForNextUpdate();
      return result.current;
    };

    it('should return npt codes and description columns as expected', async () => {
      const ndsColumnHeaders = await getHookResult();
      expect(ndsColumnHeaders).toEqual(
        expect.arrayContaining([
          expect.objectContaining({ Header: 'NPT Code' }),
          expect.objectContaining({ Header: 'Description' }),
        ])
      );
    });
  });
});
