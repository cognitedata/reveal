import { WellboreInternal } from 'domain/wells/wellbore/internal/types';

import { OptionType } from '@cognite/cogs.js';

import { mockedWellboreResultFixture } from '__test-utils/fixtures/well';

import {
  checkIndeterminateState,
  checkSelectAllState,
  getFilteredOptionTypeValues,
  getSelectedWellboresFromOptionType,
  groupOptionTypes,
  mapToGroupColumns,
  searchByDescription,
} from '../utils';

describe('common utils', () => {
  const options: OptionType<WellboreInternal>[] = [
    {
      label: 'Wellbore B',
      value: mockedWellboreResultFixture[0],
    },
    {
      label: 'Wellbore A',
      value: mockedWellboreResultFixture[1],
    },
    {
      label: 'gropup options',
      options: [
        {
          label: 'Wellbore B',
          value: mockedWellboreResultFixture[0],
        },
        {
          label: 'Wellbore A',
          value: mockedWellboreResultFixture[1],
        },
      ],
    },
  ];
  it(`should get the value of option type`, async () => {
    const result = getFilteredOptionTypeValues(options);

    expect(result[0].id).toEqual(mockedWellboreResultFixture[0].id);
    expect(result[1].id).toEqual(mockedWellboreResultFixture[1].id);
    expect(result[2]).toBeUndefined();
  });

  it(`should get all nested selected wellbores from option type`, async () => {
    const result = getSelectedWellboresFromOptionType(options);

    expect(result[0].id).toEqual(mockedWellboreResultFixture[0].id);
    expect(result[1].id).toEqual(mockedWellboreResultFixture[1].id);
    expect(result[2].id).toEqual(mockedWellboreResultFixture[0].id);
    expect(result[3].id).toEqual(mockedWellboreResultFixture[1].id);
  });

  it(`should group wellbores based on well id`, async () => {
    const data: WellboreInternal[] = mockedWellboreResultFixture.map((item) => {
      return {
        ...item,
        metadata: { wellDescription: item?.wellId || '' },
      };
    });
    const result = groupOptionTypes(data);

    expect(result[0].label).toEqual('1234');
    expect(result[0].options?.[0].label).toEqual('wellbore B desc');
    expect(result[0].options?.[1].label).toEqual('wellbore A desc');

    expect(result[1]).toBeUndefined();
  });

  it(`should search by description`, async () => {
    const result = searchByDescription(
      [mockedWellboreResultFixture[0]],
      'wellbore B desc'
    );

    expect(result[0].name).toEqual('wellbore B');

    const invalidResult = searchByDescription(
      [mockedWellboreResultFixture[0]],
      'wellbore B testss'
    );

    expect(invalidResult[0]).toBeUndefined();
  });

  it(`should check Indeterminate State`, async () => {
    const wellbores = [mockedWellboreResultFixture[0]];
    const result = checkIndeterminateState(
      mockedWellboreResultFixture,
      wellbores,
      wellbores,
      'wellbore B desc'
    );

    expect(result).toBeFalsy();

    const nonSearchresult = checkIndeterminateState(
      mockedWellboreResultFixture,
      wellbores,
      wellbores
    );
    expect(nonSearchresult).toBeTruthy();
  });

  it(`should check select all State`, async () => {
    const wellbores = [mockedWellboreResultFixture[0]];
    const result = checkSelectAllState(wellbores, wellbores, 'wellbore B desc');

    expect(result).toBeTruthy();

    const nonSearchresult = checkSelectAllState(
      [],
      [mockedWellboreResultFixture[1]],
      'wellbore'
    );
    expect(nonSearchresult).toBeFalsy();
  });

  it(`should map to group columns`, async () => {
    const wellbores = [mockedWellboreResultFixture[0]];
    const result = mapToGroupColumns(wellbores, wellbores);

    expect(result[0].columns[0].name).toEqual('wellbore B desc wellbore B');
  });
});
