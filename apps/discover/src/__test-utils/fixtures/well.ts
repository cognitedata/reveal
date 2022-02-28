import map from 'lodash/map';

import { Sequence } from '@cognite/sdk';

import {
  SequenceRow,
  Well as OldWellType,
  FilterConfig,
  FilterTypes,
  FilterCategoricalData,
  Wellbore,
  Measurement,
  Well,
} from 'modules/wellSearch/types';
import { toWellSequence } from 'modules/wellSearch/utils';

import { REGION_FIELD_BLOCK } from '../../../src/modules/wellSearch/constantsSidebarFilters';
import { StoreState } from '../../core';

import { createdAndLastUpdatedTime } from './log';

export const WELL_TRAJ_COLUMNS = [
  { name: 'MD_DSDSUNIT', externalId: 'MD_DSDSUNIT', valueType: 'STRING' },
  { name: 'OFFSET_EAST', externalId: 'OFFSET_EAST', valueType: 'DOUBLE' },
];

export const getMockWell = (extras?: Partial<Well>): Well => {
  return {
    name: 'test-well',
    description: 'test-well-desc',
    id: 1234,
    waterDepth: {
      value: 23.523422,
      unit: 'ft',
    },
    spudDate: new Date(1622190752316),
    sourceAssets: () => Promise.resolve([]),
    ...extras,
  };
};

export const getMockWellbore = (extras?: Partial<Wellbore>): Wellbore => {
  return {
    id: '1234',
    name: 'test-wellbore',
    description: 'test-wellbore-description',
    sourceWellbores: [],
    ...mockWellboreOptions,
    ...extras,
  };
};

export const getMockWellOld = (extras?: Partial<OldWellType>): OldWellType => {
  return {
    name: '16/1',
    description: 'GC16',
    sourceAssets: () => Promise.resolve([]),
    id: 1234,
    waterDepth: {
      value: 23.523422,
      unit: 'ft',
    },
    ...extras,
  };
};

export const mockedWellResultFixture: OldWellType[] = [
  getMockWell({
    name: '16/1',
    description: 'A007',
    id: 1234,
  }),
  getMockWell({
    name: '16/2',
    description: 'A008',
    id: 1235,
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
    id: 759155409324883,
    wellId: 1234,
    description: 'wellbore B desc',
    sourceWellbores: [],
    ...mockWellboreOptions,
  },
  {
    name: 'wellbore A',
    id: 759155409324993,
    externalId: 'Wellbore A:759155409324993',
    wellId: 1234,
    description: 'wellbore A desc',
    sourceWellbores: [
      {
        id: 759155409324993,
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
      1234: true,
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

export const mockedWellSearchState = {
  ...mockedWellStateFixture.wellSearch,
  wellboreData: {},
};

export const mockedSequencesResultFixture = [
  {
    parentId: 759155409324883,
    assetId: 759155409324883,
    externalId: 'BBHLH0L1CT-POS7ICp7Al-0007I',
    id: 23891231812,
    columns: [],
    lastUpdatedTime: new Date('01-01-1970'),
    createdTime: new Date('01-01-1980'),
    metadata: {
      fileType: 'MUDLOG',
      source: 'unknown',
      subType: 'Exploration',
      type: 'unknown',
      wellboreName: 'wellbore a',
    },
  },
  {
    parentId: 759155409324883,
    assetId: 123214123312,
    externalId: 'BBHLH0L1CT-POS7ICp7Al-0007I',
    id: 123213123,
    columns: [],
    lastUpdatedTime: new Date('01-01-1970'),
    createdTime: new Date('01-01-1980'),
    metadata: {
      fileType: 'MUDLOG',
      source: 'unknown',
      subType: 'Exploration',
      type: 'unknown',
      wellboreName: 'wellbore b',
    },
  },
];

export const mockedSequenceFixtures = mockedSequencesResultFixture.map(
  (asset: any) => toWellSequence(asset)
);

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

export const getDefaultSequence = () => ({ ...mockedSequenceFixtures[0] });

export const getMockFilterConfig = (extras?: any): FilterConfig => ({
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

export const getMockWellFilterConfig = () => ({
  filters: {},
  wellbores: {},
  overview: { enabled: true },
  nds: { enabled: true },
  npt: { enabled: true },
  nds_filter: { enabled: true },
  npt_filter: { enabled: true },
  data_source_filter: { enabled: false },
  field_block_operator_filter: {
    operator: { enabled: true },
    field: { enabled: true },
    block: { enabled: false },
  },
  well_characteristics_filter: {
    well_type: { enabled: true },
    kb_elevation: { enabled: false },
    tvd: { enabled: false },
    maximum_inclination_angle: { enabled: false },
    spud_date: { enabled: true },
    water_depth: { enabled: true },
  },
  measurements_filter: { enabled: true },
});

export const mockedMeasurementsResultFixture: Measurement[] = [
  {
    assetId: 759155409324883,
    externalId: 'BBHLH0L1CT-POS7ICp7Al-0007I',
    id: 23891231812,
    columns: [
      {
        name: 'SHMIN_SHALE_ML_PRE',
        valueType: 'STRING',
        ...createdAndLastUpdatedTime,
        id: 1,
      },
      {
        name: 'FRICTION_ANGLE_PRE',
        valueType: 'STRING',
        ...createdAndLastUpdatedTime,
        id: 2,
      },
      {
        name: 'CP_POST',
        valueType: 'STRING',
        ...createdAndLastUpdatedTime,
        id: 3,
      },
    ],
    lastUpdatedTime: new Date('01-01-1970'),
    createdTime: new Date('01-01-1980'),
    metadata: {
      fileType: 'MUDLOG',
      source: 'unknown',
      subType: 'Exploration',
      type: 'unknown',
      wellboreName: 'wellbore a',
    },
  },
  {
    assetId: 123214123312,
    externalId: 'BBHLH0L1CT-POS7ICp7Al-0007I',
    id: 123213123,
    columns: [
      {
        name: 'SHMIN_SHALE_ML_PRE',
        valueType: 'STRING',
        ...createdAndLastUpdatedTime,
        id: 1,
      },
      {
        name: 'PP_COMPOSITE_POST',
        valueType: 'STRING',
        ...createdAndLastUpdatedTime,
        id: 2,
      },
      {
        name: 'CP_ZERO_PRE',
        valueType: 'STRING',
        ...createdAndLastUpdatedTime,
        id: 3,
      },
    ],
    lastUpdatedTime: new Date('01-01-1970'),
    createdTime: new Date('01-01-1980'),
    metadata: {
      fileType: 'MUDLOG',
      source: 'unknown',
      subtype: 'Exploration',
      type: 'unknown',
      wellboreName: 'wellbore b',
    },
  },
];

export const mockedPpfgSequenceUnwantedGeomechanicsSequence: Sequence = {
  id: 4159684459572241,
  name: 'Geomechanic-POSTDRILL-AZE0000007600',
  description: 'Geomechanic log',
  assetId: 5228257743324276,
  externalId: 'Geomechanic-dab5caab-3433-46dc-a94d-8e636770c611',
  metadata: {
    source: 'PROD PPFG GEO',
    datasetName: 'ds-BP-ppfg',
    type: 'Depthlogs',
    startDepth: '569.0582275',
    start_depth_unit: 'm',
    endDepth: '1084.7729',
    end_depth_unit: 'm',
    wellboreName: 'SDA-09',
    parentExternalId: 'AZE0000007600',
    service_company: 'BP',
    datum_name: 'RT',
    datum_elevation: '42.0',
    datum_elevation_unit: 'm',
  },
  columns: [
    {
      id: 1,
      name: 'ECD_ACTUAL',
      externalId: 'ECD_ACTUAL',
      valueType: 'DOUBLE',
      metadata: {
        unit: 'psi',
        description: 'GEOMECHANICS-ECD',
      },
      createdTime: new Date('01-01-1980'),
      lastUpdatedTime: new Date('01-01-1970'),
    },
    {
      id: 2,
      name: 'TVD',
      externalId: 'TVD',
      valueType: 'DOUBLE',
      metadata: {
        unit: 'm',
        description: 'TVD',
      },
      createdTime: new Date('01-01-1980'),
      lastUpdatedTime: new Date('01-01-1970'),
    },
    {
      id: 3,
      name: 'TVDSS',
      externalId: 'TVDSS',
      valueType: 'DOUBLE',
      metadata: {
        unit: 'm',
        description: 'TVDSS',
      },
      createdTime: new Date('01-01-1980'),
      lastUpdatedTime: new Date('01-01-1970'),
    },
    {
      id: 4,
      name: 'MD',
      externalId: 'MD',
      valueType: 'DOUBLE',
      metadata: {
        unit: 'm',
        description: 'MD',
      },
      createdTime: new Date('01-01-1980'),
      lastUpdatedTime: new Date('01-01-1970'),
    },
  ],
  createdTime: new Date('01-01-1980'),
  lastUpdatedTime: new Date('01-01-1970'),
  dataSetId: 1627935237196353,
};

export const mockedPpfgSequenceValidPpfgSequence: Sequence = {
  id: 8108006496375278,
  name: 'POSTDRILL-AZE0000007602',
  description: 'ppfg log',
  assetId: 5764819862271496,
  externalId: 'PPFG-0424fbfb-9d5b-4feb-ab3c-049915a4a700',
  metadata: {
    source: 'PROD PPFG GEO',
    datasetName: 'ds-BP-ppfg',
    type: 'Depthlogs',
    startDepth: '142.49',
    start_depth_unit: 'm',
    endDepth: '5822.0',
    end_depth_unit: 'm',
    wellboreName: 'SDA-09Y',
    parentExternalId: 'AZE0000007602',
    service_company: 'BP',
    datum_name: 'RT',
    datum_elevation: '42.0',
    datum_elevation_unit: 'm',
  },
  columns: [
    {
      id: 1,
      name: 'FP_SHALE_POST',
      externalId: 'FP_SHALE_POST',
      valueType: 'DOUBLE',
      metadata: {
        unit: 'psi',
        description: 'PPFG-FP',
      },
      createdTime: new Date('01-01-1980'),
      lastUpdatedTime: new Date('01-01-1970'),
    },
    {
      id: 2,
      name: 'PP_COMPOSITE_POST',
      externalId: 'PP_COMPOSITE_POST',
      valueType: 'DOUBLE',
      metadata: {
        unit: 'psi',
        description: 'PPFG-PP',
      },
      createdTime: new Date('01-01-1980'),
      lastUpdatedTime: new Date('01-01-1970'),
    },
    {
      id: 3,
      name: 'FP_SAND_POST',
      externalId: 'FP_SAND_POST',
      valueType: 'DOUBLE',
      metadata: {
        unit: 'psi',
        description: 'PPFG-FP',
      },
      createdTime: new Date('01-01-1980'),
      lastUpdatedTime: new Date('01-01-1970'),
    },
    {
      id: 4,
      name: 'PP_SHALE_POST',
      externalId: 'PP_SHALE_POST',
      valueType: 'DOUBLE',
      metadata: {
        unit: 'psi',
        description: 'PPFG-PP',
      },
      createdTime: new Date('01-01-1980'),
      lastUpdatedTime: new Date('01-01-1970'),
    },
    {
      id: 5,
      name: 'SVERTICAL_POST',
      externalId: 'SVERTICAL_POST',
      valueType: 'DOUBLE',
      metadata: {
        unit: 'psi',
        description: 'PPFG-SVERTICAL',
      },
      createdTime: new Date('01-01-1980'),
      lastUpdatedTime: new Date('01-01-1970'),
    },
    {
      id: 6,
      name: 'TVD',
      externalId: 'TVD',
      valueType: 'DOUBLE',
      metadata: {
        unit: 'm',
        description: 'TVD',
      },
      createdTime: new Date('01-01-1980'),
      lastUpdatedTime: new Date('01-01-1970'),
    },
    {
      id: 6,
      name: 'TVDSS',
      externalId: 'TVDSS',
      valueType: 'DOUBLE',
      metadata: {
        unit: 'm',
        description: 'TVDSS',
      },
      createdTime: new Date('01-01-1980'),
      lastUpdatedTime: new Date('01-01-1970'),
    },
    {
      id: 7,
      name: 'MD',
      externalId: 'MD',
      valueType: 'DOUBLE',
      metadata: {
        unit: 'm',
        description: 'MD',
      },
      createdTime: new Date('01-01-1980'),
      lastUpdatedTime: new Date('01-01-1970'),
    },
  ],
  createdTime: new Date('01-01-1980'),
  lastUpdatedTime: new Date('01-01-1970'),
  dataSetId: 1627935237196353,
};

export const mockLotSequence: Sequence = {
  id: 6012889909952317,
  name: 'r0p8R',
  description: 'FormationTest',
  assetId: 5764819862271496,
  externalId: 'Z7q0J0n0Vv-wN2wjyr4uy-r0p8R',
  metadata: {
    stabilization_pressure: '',
    total_bh_press: '5410.83984543285',
    fluid_api_water_loss: '',
    lot_azimuth: '181.244513695725',
    lot_inclination: '15.2',
    lot_md: '6551.87007871395',
    lot_tvd: '6433.75984249395',
    md_water: '',
    open_hole_length: '',
    pump_height: '',
    pump_rate: '',
    stabilization_time: '',
    total_volume: '',
    vol_fluid_returned: '',
    vol_fluid_absorbed: '',
    weight_lot_emw: '15.8500058458264',
    weight_lot_amw: '14.980001951665',
    date_test: '2016-07-05T23:30:00.000000',
    is_absorption: '',
    is_fracture: '',
    lot_press: '297.0',
    test_type: 'LOT',
    lot_formation: '',
    lot_lithology: '',
    test_result: '',
    is_test_continuous: '',
    charge_loss: '',
    injection_point: '',
    is_injection: 'Y',
    type: 'FormationTest',
    stabilization_pressure_unit: 'psi',
    total_bh_press_unit: 'psi',
    fluid_api_water_loss_unit: 'cc/30min',
    lot_azimuth_unit: '°',
    lot_inclination_unit: '°',
    lot_md_unit: 'ft',
    lot_tvd_unit: 'ft',
    md_water_unit: 'ft',
    open_hole_length_unit: 'ft',
    pump_height_unit: 'ft',
    pump_rate_unit: 'gpm',
    stabilization_time_unit: 'sec',
    total_volume_unit: 'bbl',
    vol_fluid_returned_unit: 'bbl',
    vol_fluid_absorbed_unit: 'bbl',
    weight_lot_emw_unit: 'ppg',
    weight_lot_amw_unit: 'ppg',
    lot_press_unit: 'psi',
    charge_loss_unit: 'psi',
  },
  columns: [
    {
      id: 1,
      name: 'Sequence no.',
      externalId: 'sequence_no',
      description: 'Sequence number',
      valueType: 'LONG',
      metadata: {
        unit: 'psi',
      },
      createdTime: new Date('01-01-1980'),
      lastUpdatedTime: new Date('01-01-1970'),
    },
    {
      id: 2,
      name: 'pressure',
      externalId: 'pressure',
      description: 'Pressure',
      valueType: 'DOUBLE',
      metadata: {
        unit: 'psi',
      },
      createdTime: new Date('01-01-1980'),
      lastUpdatedTime: new Date('01-01-1970'),
    },
    {
      id: 3,
      name: 'hole_sect_group_id',
      externalId: 'hole_sect_group_id',
      description: 'Hole section group ID',
      valueType: 'STRING',
      metadata: {
        unit: '',
      },
      createdTime: new Date('01-01-1980'),
      lastUpdatedTime: new Date('01-01-1970'),
    },
    {
      id: 4,
      name: 'Shut in time',
      externalId: 'test_time',
      description: 'Time (duration)',
      valueType: 'DOUBLE',
      metadata: {
        unit: 'sec',
      },
      createdTime: new Date('01-01-1980'),
      lastUpdatedTime: new Date('01-01-1970'),
    },
    {
      id: 5,
      name: 'Volume',
      externalId: 'volume',
      description: 'Volume',
      valueType: 'DOUBLE',
      metadata: {
        unit: 'bbl',
      },
      createdTime: new Date('01-01-1980'),
      lastUpdatedTime: new Date('01-01-1970'),
    },
    {
      id: 6,
      name: 'BH press.',
      externalId: 'bh_pressure',
      description: 'Bottom hole pressure at current surface pressure',
      valueType: 'DOUBLE',
      metadata: {
        unit: 'psi',
      },
      createdTime: new Date('01-01-1980'),
      lastUpdatedTime: new Date('01-01-1970'),
    },
  ],
  createdTime: new Date('01-01-1980'),
  lastUpdatedTime: new Date('01-01-1970'),
  dataSetId: 2204608054006281,
};

export const mockWellboreAssetIdReverseMap = {
  '5228257743324276': 447773741957412,
  '5764819862271496': 8288044407071172,
  '2175919566408049': 8454685112415127,
  '8590690196660312': 1438285894644679,
};
