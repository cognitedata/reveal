export const configSample = {
  columns: [
    {
      property: 'isSold',
      label: 'Sold',
      optional: false,
      dataType: 'BOOLEAN',
      defaultValue: false,
      execOrder: 1,
      metadata: {},
      rules: [],
      displayOrder: 1,
    },
    {
      property: 'manufacturer',
      label: 'Manufacturer',
      optional: false,
      dataType: 'TEXT',
      defaultValue: '',
      execOrder: 1,
      metadata: {},
      rules: [],
      displayOrder: 1,
      colDef: {
        pinned: 'left',
        width: 250,
      },
    },
    {
      property: 'model',
      label: 'Model',
      optional: false,
      dataType: 'TEXT',
      defaultValue: '',
      execOrder: 1,
      metadata: {},
      rules: [],
      displayOrder: 1,
    },
    {
      property: 'modelYear',
      label: 'Year',
      optional: true,
      dataType: 'NUMBER',
      defaultValue: '',
      execOrder: 1,
      metadata: {},
      rules: [],
      displayOrder: 1,
      colDef: {
        width: 150,
        editable: true,
      },
    },
    {
      property: 'price',
      label: 'Price',
      optional: false,
      dataType: 'DECIMAL',
      defaultValue: '',
      execOrder: 1,
      metadata: {},
      rules: [],
      displayOrder: 1,
    },
    {
      property: 'currency',
      label: 'Currency',
      optional: true,
      dataType: 'TEXT',
      defaultValue: '',
      execOrder: 1,
      metadata: {},
      rules: [],
      displayOrder: 1,
    },
    {
      property: 'type',
      label: 'Type',
      optional: true,
      dataType: 'TEXT',
      defaultValue: '',
      execOrder: 1,
      metadata: {},
      rules: [],
      columnType: 'largeTextColType',
      displayOrder: 1,
    },
  ],
  customFunctions: [
    {
      name: 'FIRST',
      label: 'First item from list',
      body: 'return args[0]',
      return_type: 'NUMBER',
    },
    {
      name: 'SUM',
      label: 'First item from list',
      body: 'return args.reduce((sum, x) => (+sum) + (+x))',
      return_type: 'NUMBER',
    },
  ],
  dataSources: [
    {
      name: 'assignCampaignsTypeDataSource',
      data_source_type: 'OBJECT_LIST',
      metadata: {
        items_label_property: 'label',
        items_value_property: 'value',
        items: [
          {
            value: 'attachNew',
            label: 'Create campaign',
          },
          {
            value: 'attachExisting',
            label: 'Attach existing',
          },
        ],
      },
    },
    {
      name: 'currenciesDataSource',
      data_source_type: 'LIST',
      metadata: {
        items: ['NOK', 'USD', 'EUR'],
      },
    },
    {
      name: 'statusObjectsListDataSource',
      data_source_type: 'OBJECT_LIST',
      metadata: {
        items_label_property: 'name',
        items_value_property: 'id',
        items: [
          {
            id: 1,
            name: 'DRAFT',
          },
          {
            id: 2,
            name: 'APPROVED',
          },
        ],
      },
    },
    {
      name: 'Simple List data source',
      data_source_type: 'LIST',
      metadata: {
        items: ['DRAFT', 'APPROVED'],
      },
    },
    {
      name: 'Object list data source',
      data_source_type: 'OBJECT_LIST',
      metadata: {
        items_label_property: 'id',
        items_value_property: 'value',
        items: [
          {
            id: 1,
            value: 'DRAFT',
          },
          {
            id: 2,
            value: 'APPROVED',
          },
        ],
      },
    },
    {
      name: 'API list data source',
      data_source_type: 'LOOKUP',
      metadata: {
        items_label_property: 'name',
        items_value_property: 'id',
        items_lookup_api: 'https://jsonplaceholder.typicode.com/users',
      },
    },
  ],
};
