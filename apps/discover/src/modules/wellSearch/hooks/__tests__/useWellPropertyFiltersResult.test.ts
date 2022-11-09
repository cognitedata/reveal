import 'domain/wells/__mocks/setupWellsMockSDK';

import { getMockUserMe } from 'domain/userManagementService/service/__mocks/getMockUserMe';
import { WellPropertyFilterIDs } from 'domain/wells/summaries/internal/types';
import { getMockWellPropertiesPost } from 'domain/wells/summaries/service/__mocks/getMockWellPropertiesPost';

import { renderHook } from '@testing-library/react-hooks';
import { setupServer } from 'msw/node';

import { testWrapper as wrapper } from '__test-utils/renderer';
import { FilterIDs } from 'modules/wellSearch/constants';
import { WellFilterMap } from 'modules/wellSearch/types';

import { useWellPropertyFiltersResult } from '../useWellPropertyFiltersResult';

const mockServer = setupServer(getMockUserMe(), getMockWellPropertiesPost());

let selectedOptions: WellFilterMap = {
  [FilterIDs.REGION]: [],
  [FilterIDs.FIELD]: [],
  [FilterIDs.BLOCK]: [],
};

const selectOption = (id: WellPropertyFilterIDs, value: string) => {
  selectedOptions = {
    ...selectedOptions,
    [id]: [...selectedOptions[id], value],
  };
};

const removeOption = (id: WellPropertyFilterIDs, value: string) => {
  selectedOptions = {
    ...selectedOptions,
    [id]: (selectedOptions[id] as string[]).filter(
      (currentValue) => currentValue !== value
    ),
  };
};

const getHookResult = async () => {
  const { waitForNextUpdate, result } = renderHook(
    () => useWellPropertyFiltersResult(selectedOptions),
    { wrapper }
  );
  await waitForNextUpdate();
  return result.current;
};

describe('useWellPropertyFiltersResult', () => {
  beforeAll(() => mockServer.listen());
  afterAll(() => mockServer.close());

  it('should return empty result for empty selection', async () => {
    expect(await getHookResult()).toStrictEqual({
      [FilterIDs.REGION]: [],
      [FilterIDs.FIELD]: [],
      [FilterIDs.BLOCK]: [],
    });
  });

  it('should not select children on parent selection', async () => {
    selectOption(FilterIDs.REGION, 'Discover');
    expect(await getHookResult()).toStrictEqual({
      [FilterIDs.REGION]: ['Discover'],
      [FilterIDs.FIELD]: [],
      [FilterIDs.BLOCK]: [],
    });
  });

  it('should select parents for selected child', async () => {
    selectOption(FilterIDs.FIELD, 'Callisto');
    expect(await getHookResult()).toStrictEqual({
      [FilterIDs.REGION]: ['Discover', 'Jovian System'],
      [FilterIDs.FIELD]: ['Callisto'],
      [FilterIDs.BLOCK]: [],
    });

    selectOption(FilterIDs.BLOCK, 'Achelous');
    expect(await getHookResult()).toStrictEqual({
      [FilterIDs.REGION]: ['Discover', 'Jovian System', 'Volve'],
      [FilterIDs.FIELD]: ['Callisto', 'Ganymede'],
      [FilterIDs.BLOCK]: ['Achelous'],
    });
  });

  it('should remain same for child selection of already selected parents', async () => {
    selectOption(FilterIDs.BLOCK, 'Adad');
    expect(await getHookResult()).toStrictEqual({
      [FilterIDs.REGION]: ['Discover', 'Jovian System', 'Volve'],
      [FilterIDs.FIELD]: ['Callisto', 'Ganymede'],
      [FilterIDs.BLOCK]: ['Achelous', 'Adad'],
    });
  });

  it('should remove parents when all its children are removed', async () => {
    removeOption(FilterIDs.BLOCK, 'Adad');
    expect(await getHookResult()).toStrictEqual({
      [FilterIDs.REGION]: ['Discover', 'Jovian System', 'Volve'],
      [FilterIDs.FIELD]: ['Callisto', 'Ganymede'],
      [FilterIDs.BLOCK]: ['Achelous'],
    });

    removeOption(FilterIDs.BLOCK, 'Achelous');
    expect(await getHookResult()).toStrictEqual({
      [FilterIDs.REGION]: ['Discover', 'Jovian System'],
      [FilterIDs.FIELD]: ['Callisto'],
      [FilterIDs.BLOCK]: [],
    });

    removeOption(FilterIDs.FIELD, 'Callisto');
    expect(await getHookResult()).toStrictEqual({
      [FilterIDs.REGION]: ['Discover'],
      [FilterIDs.FIELD]: [],
      [FilterIDs.BLOCK]: [],
    });
  });

  it('should return to empty selection when all options have been removed', async () => {
    removeOption(FilterIDs.REGION, 'Discover');
    expect(await getHookResult()).toStrictEqual({
      [FilterIDs.REGION]: [],
      [FilterIDs.FIELD]: [],
      [FilterIDs.BLOCK]: [],
    });
  });
});
