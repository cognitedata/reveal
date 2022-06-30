import { Well as OldWellType, Well } from 'domain/wells/well/internal/types';
import { Wellbore } from 'domain/wells/wellbore/internal/types';

import map from 'lodash/map';

import { REGION_FIELD_BLOCK } from 'modules/wellSearch/constantsSidebarFilters';
import {
  SequenceRow,
  FilterConfig,
  FilterTypes,
  FilterCategoricalData,
} from 'modules/wellSearch/types';

import { StoreState } from '../../core';

export const WELL_TRAJ_COLUMNS = [
  { name: 'MD_DSDSUNIT', externalId: 'MD_DSDSUNIT', valueType: 'STRING' },
  { name: 'OFFSET_EAST', externalId: 'OFFSET_EAST', valueType: 'DOUBLE' },
];

/**
 * @deprecated - use domain/wells/well/service/__fixtures/well OR domain/wells/well/internal/__fixtures/well
 */
export const getMockWell = (extras?: Partial<Well>): Well => {
  return {
    name: 'test-well',
    description: 'test-well-desc',
    id: '1234',
    waterDepth: {
      value: 23.523422,
      unit: 'ft',
    },
    spudDate: new Date(1622190752316),
    sourceAssets: () => Promise.resolve([]),
    sourceList: 'source1',
    ...extras,
  };
};

export const mockedWellResultFixture: OldWellType[] = [
  getMockWell({
    name: '16/1',
    description: 'A007',
    id: '1234',
  }),
  getMockWell({
    name: '16/2',
    description: 'A008',
    id: '1235',
  }),
];

export const mockWellboreOptions = {
  trajectory: jest.fn(),
  casings: jest.fn(),
  parentWell: jest.fn(),
  getWellhead: jest.fn(),
  sourceAssets: jest.fn(),
};

export const mockedWellboreResultFixture: Wellbore[] = [
  {
    name: 'wellbore B',
    id: '759155409324883',
    matchingId: '759155409324883',
    wellId: '1234',
    wellMatchingId: '1234',
    description: 'wellbore B desc',
    sourceWellbores: [],
    ...mockWellboreOptions,
  },
  {
    name: 'wellbore A',
    id: '759155409324993',
    matchingId: '759155409324993',
    externalId: 'Wellbore A:759155409324993',
    wellId: '1234',
    wellMatchingId: '1234',
    description: 'wellbore A desc',
    sourceWellbores: [
      {
        id: '759155409324993',
        externalId: 'Wellbore A:759155409324993',
        source: 'Source A',
      },
    ],
    ...mockWellboreOptions,
  },
];

export const mockedWellsFixture = mockedWellResultFixture.map((well) => ({
  ...well,
  wellbores: mockedWellboreResultFixture.filter(
    (wellbore) => wellbore.wellId === well.id
  ),
}));

export const mockedWellsFixtureWellIds = map(mockedWellsFixture, 'id');
export const mockedWellsFixtureWellbores = mockedWellsFixture.flatMap(
  (well) => well.wellbores
);
export const mockedWellsFixtureWellboreIds = map(
  mockedWellsFixtureWellbores,
  'id'
);

export const mockedWellStateFixture = {
  wellSearch: {
    wells: mockedWellResultFixture.map((well) => ({
      ...well,
      wellbores: mockedWellboreResultFixture.filter(
        (wellbore) => wellbore.wellId === well.id
      ),
    })),
  },
};

// TODO(PP-2544): Remove all ts-ignore and fix tests properly
/* eslint-disable @typescript-eslint/ban-ts-comment */
export const mockedWellStateWithSelectedWells: StoreState = {
  wellSearch: {
    ...mockedWellStateFixture.wellSearch,
    selectedWellIds: {
      '1234': true,
    },
    selectedWellboreIds: {
      '759155409324993': true,
    },
    // this will be gone soon, transferred to react-query
    wellboreData: {
      '759155409324993': {
        // @ts-ignore
        logType: [],
        ppfg: [],
      },
      '7591554': {
        logType: [],
        ppfg: [],
        digitalRocks: [
          {
            // @ts-ignore
            asset: {
              id: 1123123,
            },
          },
        ],
      },
      '75915540932499342': {
        logType: [],
        ppfg: [],
        digitalRocks: [
          {
            // @ts-ignore
            asset: {
              id: 1123123,
            },
            digitalRockSamples: [
              {
                // @ts-ignore
                asset: {
                  id: 122342,
                },
              },
            ],
          },
        ],
      },
      '75915540932499343': {
        logType: [],
        ppfg: [],
        digitalRocks: [
          {
            // @ts-ignore
            asset: {
              id: 1123123,
            },
            digitalRockSamples: [
              {
                // @ts-ignore
                asset: {
                  id: 122342,
                },
                // @ts-ignore
                gpart: [{ id: 32134 }],
              },
            ],
          },
        ],
      },
      '75915540932499344': {
        logType: [],
        ppfg: [],
        digitalRocks: [
          {
            // @ts-ignore
            asset: {
              id: 1123123,
            },
            digitalRockSamples: [
              {
                // @ts-ignore
                asset: {
                  id: 122342,
                },
                gpart: [
                  {
                    sequence: {
                      id: 32134,
                      columns: [
                        // @ts-ignore
                        {
                          name: 'ColumnA',
                        },
                        // @ts-ignore
                        {
                          name: 'ColumnB',
                        },
                        // @ts-ignore
                        {
                          name: 'ColumnY',
                        },
                      ],
                    },
                    rows: [
                      new SequenceRow(
                        0,
                        [1, 2, 3, 4],
                        [
                          {
                            name: 'ColumnA',
                          },
                          {
                            name: 'ColumnB',
                          },
                          {
                            name: 'ColumnY',
                          },
                        ]
                      ),
                    ],
                  },
                ],
              },
            ],
          },
        ],
      },
    },
  },
  wellInspect: {
    selectedWellIds: {},
    selectedWellboreIds: {},
    coloredWellbores: false,
    selectedRelatedDocumentsColumns: {
      fileName: true,
      author: true,
      topFolder: true,
      source: true,
      category: true,
    },
    goBackNavigationPath: '',
  },
};

export const mockedWellStateWithWellInspect = {
  ...mockedWellStateWithSelectedWells,
  wellInspect: {
    selectedWellIds: {
      'test-well-1': true,
    },
    selectedWellboreIds: {
      'test-well-1': true,
    },
  },
};

export const getDefaultWell = (includeWellBore = false) => {
  const well: OldWellType = mockedWellResultFixture[0];
  return {
    ...well,
    wellbores: includeWellBore ? [getDefaultWellbore()] : undefined,
  };
};

export const getDefaultWellbore = () => ({
  ...mockedWellboreResultFixture[0],
  wellId: mockedWellResultFixture[0].id,
});

export const getMockFilterConfig = (
  extras?: Partial<FilterConfig>
): FilterConfig => ({
  id: 12345,
  name: 'filter-name',
  key: 'filter-key',
  category: 'filter-category',
  type: FilterTypes.CHECKBOXES,
  ...extras,
});

export const getMockFilterConfigByCategory = (): FilterCategoricalData[] => [
  {
    title: REGION_FIELD_BLOCK,
    filterConfigs: [
      {
        id: 2,
        name: 'Field',
        key: 'field_block_operator_filter.field',
        category: REGION_FIELD_BLOCK,
        type: 0,
      },
      {
        id: 4,
        category: REGION_FIELD_BLOCK,
        key: 'field_block_operator_filter.operator',
        name: 'Operator',
        type: 0,
        isTextCapitalized: false,
      },
    ],
    filterConfigIds: [2, 4],
  },
  {
    title: 'Well Characteristics',
    filterConfigs: [
      {
        id: 7,
        name: 'Water Depth (ft)',
        key: 'well_characteristics_filter.water_depth',
        category: 'Well Characteristics',
        type: 2,
      },
      {
        id: 8,
        name: 'Spud Date',
        key: 'well_characteristics_filter.spud_date',
        category: 'Well Characteristics',
        type: 3,
      },
    ],
    filterConfigIds: [7, 8],
  },
  {
    title: 'Measurements',
    filterConfigs: [
      {
        id: 10,
        name: '',
        key: 'measurements_filter',
        category: 'Measurements',
        type: 1,
        isTextCapitalized: false,
      },
    ],
    filterConfigIds: [10],
  },
  {
    title: 'NDS - No Drilling Surprise',
    filterConfigs: [
      {
        id: 12,
        key: 'nds_filter',
        name: 'NDS Risk Type',
        category: 'NDS - No Drilling Surprise',
        type: 0,
      },
      {
        id: 13,
        key: 'nds_filter',
        name: 'NDS Severity',
        category: 'NDS - No Drilling Surprise',
        type: 0,
      },
      {
        id: 14,
        key: 'nds_filter',
        name: 'NDS Probability',
        category: 'NDS - No Drilling Surprise',
        type: 0,
      },
    ],
    filterConfigIds: [12, 13, 14],
  },
  {
    title: 'NPT - Non Productive Time',
    filterConfigs: [
      {
        id: 15,
        name: 'NPT Duration (hrs)',
        key: 'npt_filter',
        category: 'NPT - Non Productive Time',
        type: 2,
      },
      {
        id: 16,
        name: 'NPT Code',
        key: 'npt_filter',
        category: 'NPT - Non Productive Time',
        type: 0,
      },
      {
        id: 17,
        name: 'NPT Detail Code',
        key: 'npt_filter',
        category: 'NPT - Non Productive Time',
        type: 0,
      },
    ],
    filterConfigIds: [15, 16, 17],
  },
];
