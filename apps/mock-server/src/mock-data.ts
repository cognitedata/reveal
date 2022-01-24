import { MockData } from './app/types';

export const mockDataSample = {
  assets: [
    {
      id: 2113091281838299,
      externalId: 'LOR_NORWAY',
      name: 'Norway',
      labels: [{ externalId: 'MOCK_NETWORK_LEVEL_COUNTRY' }],
      metadata: {
        model_id: 'VAL',
        'Network Level': 'Country',
      },
      persistent: true,
    },
    {
      id: 1381646092015199,
      parentExternalId: 'LOR_NORWAY',
      externalId: 'LOR_OSLO',
      name: 'Oslo',
      labels: [{ externalId: 'MOCK_NETWORK_LEVEL_PRODUCTION_SYSTEM' }],
      metadata: {
        'Network Level': 'Production System',
      },
    },
    {
      id: 6195082058305299,
      parentExternalId: 'LOR_OSLO',
      externalId: 'LOR_ARENDAL',
      name: 'Arendal',
      labels: [{ externalId: 'MOCK_NETWORK_LEVEL_PRODUCTION_SUBSYSTEM' }],
      metadata: {
        'Network Level': 'Production Subsystem',
      },
    },
    {
      id: 3012812817955099,
      parentExternalId: 'LOR_OSLO',
      externalId: 'LOR_DRAMMEN',
      name: 'Drammen',
      labels: [{ externalId: 'MOCK_NETWORK_LEVEL_PRODUCTION_SUBSYSTEM' }],
      metadata: {
        'Network Level': 'Production Subsystem',
      },
    },
    {
      id: 4250398302178899,
      parentExternalId: 'LOR_DRAMMEN',
      externalId: 'LOR_DRAMMEN_WELL_01',
      labels: [
        { externalId: 'MOCK_NETWORK_LEVEL_WELL' },
        { externalId: 'MOCK_WELL_FLAG_GAS' },
        { externalId: 'MOCK_ARTIFICIAL_LIFT_PUMP' },
      ],
      metadata: {
        'Network Level': 'well',
      },
      name: 'Narvik 01',
    },
    {
      id: 1813736367545799,
      parentExternalId: 'LOR_DRAMMEN',
      externalId: 'LOR_DRAMMEN_WELL_02',
      labels: [
        { externalId: 'MOCK_NETWORK_LEVEL_WELL' },
        { externalId: 'MOCK_WELL_FLAG_GAS' },
        { externalId: 'MOCK_ARTIFICIAL_LIFT_PUMP' },
      ],
      metadata: {
        'Network Level': 'well',
      },
      name: 'Narvik 02',
    },
  ],
  datasets: [
    {
      externalId: 'MOCK_COMMENTS',
      name: 'MOCK_COMMENTS',
      description: 'MOCK_COMMENTS',
      id: 3525327311449925,
    },
  ],
  events: [
    {
      externalId: 'comment_afbaff95-292e-470b-9697-d93f84d59d4a_1611075249599',
      dataSetId: 3525327311449925,
      startTime: 1611075249599,
      type: 'demo_review_comment',
      subtype: 'afbaff95-292e-470b-9697-d93f84d59d4a',
      metadata: {
        content: 'Looks ok',
        role: 'reviewer',
      },
      source: 'john.doe@cognitedata.com',
      id: 4018246335157130,
      lastUpdatedTime: 1611075249865,
      createdTime: 1611075249865,
    },
    {
      externalId: '60014931',
      dataSetId: 5147221221011500,
      startTime: 1613088000000,
      endTime: 1613088000000,
      type: 'workorder',
      subtype: 'EP02',
      description: 'WELL_02 EXTERNAL VESSEL INSPECTION',
      metadata: {
        'Functional Location': 'LOR_DRAMMEN_WELL_02',
      },
      assetIds: [1813736367545799],
      source: 'sap',
      id: 6693496708513673,
      lastUpdatedTime: 1610983084485,
      createdTime: 1610983084485,
    },
    {
      externalId: '60015664',
      dataSetId: 5147221221011500,
      startTime: 1614556800000,
      endTime: 1614556800000,
      type: 'workorder',
      subtype: 'EP02',
      description: 'Q MPA V-1234 EXTERNAL VESSEL INSPECTION',
      metadata: {
        'Functional Location': 'LOR_DRAMMEN_WELL_02',
      },
      assetIds: [1813736367545799],
      source: 'sap',
      id: 2632793472586538,
      lastUpdatedTime: 1610983094180,
      createdTime: 1610983094180,
    },
  ],
  templategroups: [
    {
      externalId: 'schema-versions-test',
      description: 'Template group with multiple schema versions',
      owners: [],
      createdTime: 1638889081775,
      lastUpdatedTime: 1638889081775,
    },
    {
      externalId: 'test-template',
      description: 'Template group with owner',
      owners: ['john.doe@mail.com'],
      createdTime: 1636116168943,
      lastUpdatedTime: 1636116168943,
    },
    {
      externalId: 'test-schema',
      description: 'Test schema',
      owners: [],
      createdTime: 1637750633523,
      lastUpdatedTime: 1637750633523,
    },
    {
      externalId: 'new-schema',
      description: '',
      owners: [],
      createdTime: 1638531613197,
      lastUpdatedTime: 1638531613197,
    },
    {
      externalId: 'templates-schema',
      description: 'Test small templates like schema',
      owners: [],
      createdTime: 1638531613197,
      lastUpdatedTime: 1638531613197,
    },
  ],
  templates: [
    {
      version: 13,
      schema:
        'type Person @template {\n  firstName: String\n  lastName: String\n  email: String\n  age: Long\n}\n\ntype Product @template {\n  name: String\n  price: Float\n  image: String\n  description: String\n}\n\ntype Category @template {\n  name: String\n  products: [Product]\n}\n',
      createdTime: 1638891917037,
      lastUpdatedTime: 1638891917037,
      templategroups_id: 'schema-versions-test',
    },
    {
      version: 12,
      schema:
        'type Person @template {\n  firstName: String\n  lastName: String\n  email: String\n  age: Long\n}\n\ntype Product @template {\n  name: String\n  price: Float\n  image: String\n  description: String\n}\n\ntype Category @template {\n  name: String\n  products: [Product]\n}\n',
      createdTime: 1638889081775,
      lastUpdatedTime: 1638889081775,
      templategroups_id: 'schema-versions-test',
    },
    {
      version: 1,
      schema:
        'type Person @template {\n  firstName: String\n  lastName: String\n  email: String\n  age: Long\n}\n\ntype Product @template {\n  name: String\n  price: Float\n  image: String\n  description: String\n}\n\ntype Category @template {\n  name: String\n  products: [Product]\n}\n',
      createdTime: 1639476522639,
      lastUpdatedTime: 1639477614908,
      templategroups_id: 'new-schema',
      db: {
        Person: [
          {
            id: 1,
            firstName: 'John',
            lastName: 'Doe',
            email: 'john.doe@email.com',
            age: 30,
          },
          {
            id: 2,
            firstName: 'James',
            lastName: 'Bond',
            email: 'james.bond@email.com',
            age: 36,
          },
          {
            id: 3,
            firstName: 'Emily',
            lastName: 'Venny',
            email: 'Emily.Venny@email.com',
            age: 25,
          },
          {
            id: 4,
            firstName: 'James',
            lastName: 'Bond 007',
            email: 'james.bond007@email.com',
            age: 40,
          },
        ],
        Product: [
          {
            id: 1,
            name: 'iPhone',
            description: "Worlds's best Smartphone",
            price: 999,
            image: 'https://picsum.photos/200/300',
            category_id: 1,
          },
        ],
        Category: [
          {
            id: 1,
            name: 'Electronics',
          },
        ],
      },
    },
    {
      version: 1,
      schema:
        'type System @template {\n  asset: Asset!\n  labels: [String]\n  wells: [Well!]!\n  subSystems: [System!]!\n  isActive: Boolean\n}\n\ntype Well @template {\n  asset: Asset!\n  type: String!\n  mainProduct: TimeSeries!\n}',
      createdTime: 1639476522639,
      lastUpdatedTime: 1639477614908,
      templategroups_id: 'templates-schema',
      db: {
        System: [
          {
            id: 1,
            asset_id: 2113091281838299,
            labels: ['LOR_NORWAY'],
            wells: [],
            subSystems: [3012812817955099],
            isActive: true,
          },
          {
            id: 2,
            asset_id: 3012812817955099,
            labels: ['MOCK_NETWORK_LEVEL_PRODUCTION_SUBSYSTEM'],
            wells: [1],
            subSystems: [3012812817955099],
            isActive: true,
          },
        ],
        Well: [
          {
            id: 1,
            asset_id: 4250398302178899,
            type: 'Well',
            mainProduct: [],
          },
          {
            id: 2,
            asset_id: 1813736367545799,
            type: 'Well',
            mainProduct: [],
          },
        ],
      },
    },
  ],
} as MockData;
