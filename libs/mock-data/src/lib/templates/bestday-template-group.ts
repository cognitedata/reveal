export const bestDayGraphQlSchema = `
type System @template {
  asset: Asset!
  wells: [Well!]!
  subSystems: [System!]!
  products: [Product!]!
  deferments: [Deferment!]!
}

type Well @template {
  asset: Asset!
  type: String!
  mainProduct: TimeSeries!
  products: [Product!]!
  measurements: [Measurement!]!
  deferments: [Deferment!]!
}

type Product @template {
  type: String!
  production: [Production!]!
  deferments: [DefermentTimeSeries!]!
  deviations: Deviations
  capacity: [Capacity!]!
}

type Capacity @template {
  type: String!
  timeSeries: TimeSeries
}

type Production @template {
  frequency: String!
  timeSeries: TimeSeries
}

type Deviations @template {
   timeSeries: TimeSeries
}

type DefermentTimeSeries @template {
  type: String!
  timeSeries: TimeSeries
  syntheticTimeSeries: SyntheticTimeSeries
}

type Measurement @template {
  type: String!
  timeSeries: TimeSeries!
  unit: String
}

type Deferment @template {
  externalId: String!
  assetIds: [Long!]!
  name: String
  status: String
  type: String
  startTime: Long!
  endTime: Long
  lastUpdatedTime: Long
  createdTime: Long
  reason: String
  comment: String
  choke: String
  subChoke: String
  facilityString: String
}
`;
export const bestDayTemplateMockData = {
  version: 1,
  schema: bestDayGraphQlSchema,
  createdTime: 1639476522639,
  lastUpdatedTime: 1639477614908,
  templategroups_id: 'BestDay',
  db: {
    System: [
      {
        id: 100,
        externalId: '100',
        asset: { id: 2113091281838299 },
        wells: [{ id: 200 }],
        subSystems: [{ id: 101 }],
        products: [],
        deferments: [],
      },
      {
        id: 101,
        externalId: '101',
        asset: { id: 1024089787197873 },
        wells: [{ id: 200 }],
        subSystems: [],
        products: [{ id: 401 }],
        deferments: [],
      },
    ],
    Well: [
      {
        id: 200,
        asset: { id: 4642328515242672 },
        type: 'OIL',
        mainProduct: {
          externalId: 'LOR_OSLO_WELL_01_MAIN_PRODUCT_HISTORY',
        },
        products: [{ id: 400 }, { id: 401 }],
        measurements: [{ id: 900 }, { id: 901 }, { id: 902 }],
        deferments: [],
      },
    ],
    Product: [
      {
        id: 400,
        type: 'OIL',
        production: [{ id: 500 }],
        deferments: [{ id: 600 }],
        deviations: { id: 700 },
        capacity: [{ id: 800 }, { id: 801 }],
      },
      {
        id: 401,
        type: 'OIL_test',
        production: [{ id: 501 }],
        deferments: [{ id: 601 }, { id: 602 }],
        deviations: { id: 701 },
        capacity: [{ id: 802 }, { id: 803 }],
      },
    ],
    Production: [
      {
        id: 500,
        timeSeries: [
          {
            id: 6960147550797649,
          },
        ],
        frequency: 'daily',
      },
      {
        id: 501,
        timeSeries: {
          externalId: 'LOR_OSLO_OIL_PRODUCTION',
        },
        frequency: 'daily',
      },
    ],
    DefermentTimeSeries: [
      {
        id: 600,
        timeSeries: {
          id: 5993034217333774,
        },
        syntheticTimeSeries: {
          id: 5993034217333774,
        },
        type: 'ACTUAL',
      },
      {
        id: 601,
        timeSeries: {
          id: 5313331855438592,
        },
        syntheticTimeSeries: {
          id: 5313331855438592,
        },
        type: 'ACTUAL',
      },
      {
        id: 602,
        timeSeries: {
          id: 5177491055490558,
        },
        syntheticTimeSeries: {
          id: 5177491055490558,
        },
        type: 'FUTURE',
      },
    ],
    Deviations: [
      {
        id: 700,
        timeSeries: {
          id: 8298799994355582,
        },
      },
      {
        id: 701,
        timeSeries: {
          id: 5538341935951402,
        },
      },
    ],
    Capacity: [
      {
        id: 800,
        timeSeries: {
          id: 645682088289450,
        },
        type: 'BESTDAY_CAPACITY',
      },
      {
        id: 801,
        timeSeries: {
          id: 4310648641093310,
        },
        type: 'MPC',
      },
      {
        id: 802,
        timeSeries: {
          id: 4843150537594281,
        },
        type: 'BESTDAY_CAPACITY',
      },
      {
        id: 803,
        timeSeries: {
          id: 1662298273488591,
        },
        type: 'IPSC',
      },
    ],
    Measurement: [
      {
        id: 900,
        timeSeries: {
          id: 6887876741987405,
        },
        type: 'GOR_RATIO',
      },
      {
        id: 901,
        timeSeries: {
          id: 6097187482808082,
        },
        type: 'WELL_HEAD_CASING_PRESSURE',
      },
      {
        id: 902,
        timeSeries: {
          id: 5771571479866378,
        },
        type: 'MOTOR_FREQUENCY',
      },
    ],
  },
};
