import {
  Wrapper,
  MainTitle,
  MainDescription,
  GroupTitle,
  Group,
} from '@platypus-app/components/Styles/storybook';
import { CogDataGrid, GridConfig } from '@cognite/cog-data-grid';
import { useCallback, useMemo, useState } from 'react';
import { TypeList } from '../components/TypeList/TypeList';
import {
  ColDef,
  GetRowIdParams,
  GridReadyEvent,
  IDatasource,
  IGetRowsParams,
} from 'ag-grid-community';

const configMock = {
  columns: [
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
        width: 240,
      },
    },
    {
      property: 'models',
      label: 'Models',
      optional: false,
      dataType: 'NUMBER',
      isList: true,
      defaultValue: [],
      execOrder: 1,
      metadata: {},
      rules: [],
      displayOrder: 1,
      colDef: {
        editable: false,
      },
    },
    {
      property: 'company',
      label: 'Company',
      optional: false,
      dataType: 'CUSTOM',
      defaultValue: '',
      colDef: {
        editable: false,
      },
    },
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
  customFunctions: [],
  dataSources: [],
} as GridConfig;

const responseMock = [
  {
    id: 1,
    isSold: false,
    manufacturer: 'Audi',
    model: 'A4',
    modelYear: 2016,
    price: 245000,
    currency: 'NOK',
    type: 'sedan',
    models: [],
    company: { name: 'AAA', externalId: 'AAA' },
  },
  {
    id: 2,
    isSold: true,
    manufacturer: 'Audi',
    model: 'A5',
    modelYear: 2016,
    price: 265000,
    currency: 'NOK',
    type: 'sedan',
    models: [1, 3, 44],
    company: { name: 'BBB', externalId: 'BBB' },
  },
  {
    id: 3,
    isSold: false,
    manufacturer: 'BMW',
    model: 'M3',
    modelYear: 2016,
    price: 225000,
    currency: 'NOK',
    type: 'sedan',
    models: [22, 33, 44, 55, 66, 77],
    company: { name: 'CCC', externalId: 'CCC' },
  },
  {
    id: 4,
    isSold: false,
    manufacturer: 'VW',
    model: 'Passat',
    modelYear: 2014,
    price: 185000,
    currency: '',
    type: '',
    models: [220.0298, 11, 2, 333, 444, 555],
    company: { name: 'DDD', externalId: 'DDD' },
  },
];

const sortData = (sortModel: any, data: any[]) => {
  const sortPresent = sortModel && sortModel.length > 0;
  if (!sortPresent) {
    return data;
  }
  // do an in memory sort of the data, across all the fields
  const resultOfSort = data.slice();
  resultOfSort.sort(function (a, b) {
    for (let k = 0; k < sortModel.length; k++) {
      const sortColModel = sortModel[k];
      const valueA = a[sortColModel.colId];
      const valueB = b[sortColModel.colId];
      // this filter didn't find a difference, move onto the next one
      if (valueA === valueB) {
        continue;
      }
      const sortDirection = sortColModel.sort === 'asc' ? 1 : -1;
      if (valueA > valueB) {
        return sortDirection;
      } else {
        return sortDirection * -1;
      }
    }
    // no filters found a difference
    return 0;
  });
  return resultOfSort;
};

const DataGridComponent = () => {
  const [data, setData] = useState(responseMock);

  const onCellValueChanged = (e: any) => {
    const { rowIndex, value, colDef } = e;
    const field = colDef.field;

    const newData = data.map((el, idx) => {
      if (idx === rowIndex) return { ...el, [field]: value };
      return el;
    });

    setData(newData);
  };

  return (
    <div style={{ height: '100%' }}>
      <CogDataGrid
        data={responseMock}
        config={configMock}
        onCellValueChanged={onCellValueChanged}
      />
    </div>
  );
};

export default {
  title: 'DataPreview / DataGrid',
  component: DataGridComponent,
};

export const Default = () => (
  <Wrapper>
    <MainTitle>Default (compact) Data Grid Component</MainTitle>
    <MainDescription title="Where is it used?">
      This is generic table component that will be used on many pages like
      deployments..etc.
    </MainDescription>
    <Group>
      <GroupTitle>Default</GroupTitle>
      <div style={{ height: '600px' }}>
        <DataGridComponent />
      </div>
    </Group>
  </Wrapper>
);

export const DataPreview = () => (
  <Wrapper>
    <MainTitle>Data Preview Component</MainTitle>
    <MainDescription title="Where is it used?">
      This component is used on Solution/Data Model/DataPreview page.
    </MainDescription>
    <Group>
      <GroupTitle>Default</GroupTitle>
      <div style={{ height: '600px' }}>
        <DataGridComponent />
      </div>
    </Group>
  </Wrapper>
);

export const DataPreviewInfiniteModel = () => {
  const [data, setData] = useState(responseMock);

  const defaultColDef = useMemo<ColDef>(() => {
    return {
      flex: 1,
      minWidth: 150,
      sortable: true,
      resizable: true,
      floatingFilter: false,
    };
  }, []);
  const getRowId = useCallback(function (params: GetRowIdParams) {
    return params.data.id;
  }, []);
  const onGridReady = useCallback((params: GridReadyEvent) => {
    const dataSource: IDatasource = {
      rowCount: undefined,
      getRows: (getRowsParams: IGetRowsParams) => {
        console.log('asking new rows' + getRowsParams);

        const mockedData = sortData(getRowsParams.sortModel, responseMock);

        // At this point in your code, you would call the server.
        // To make the demo look real, wait for 500ms before returning
        setTimeout(function () {
          // if on or after the last page, work out the last row.
          let lastRow = -1;
          if (mockedData.length <= getRowsParams.endRow) {
            lastRow = mockedData.length;
          }
          // call the success callback
          getRowsParams.successCallback(mockedData, lastRow);
        }, 500);
      },
    };

    params.api.setDatasource(dataSource);
  }, []);

  return (
    <Wrapper>
      <MainTitle>Data Preview Component</MainTitle>
      <Group>
        <GroupTitle>Default</GroupTitle>
        <div style={{ height: '600px' }}>
          <div style={{ height: '100%' }}>
            <CogDataGrid
              data={responseMock}
              config={configMock}
              defaultColDef={defaultColDef}
              rowSelection={'multiple'}
              rowModelType={'infinite'}
              cacheBlockSize={100}
              cacheOverflowSize={2}
              maxConcurrentDatasourceRequests={2}
              infiniteInitialRowCount={1}
              maxBlocksInCache={2}
              getRowId={getRowId}
              onGridReady={onGridReady}
            />
          </div>
        </div>
      </Group>
    </Wrapper>
  );
};

export const TypeListPreview = () => {
  const [selected, setSelected] = useState<string | undefined>(undefined);
  return (
    <Wrapper>
      <MainTitle>Type List Preview Component</MainTitle>
      <MainDescription title="Where is it used?">
        This component is used on Solution/Data Model/DataPreview page.
      </MainDescription>
      <Group>
        <GroupTitle>Default</GroupTitle>
        <div style={{ height: '600px' }}>
          <TypeList
            placeholder="Filter"
            dataModelExternalId="modelExternalId"
            items={[
              { name: 'System', description: '7 properties', fields: [] },
              { name: 'Well', description: '5 properties', fields: [] },
              { name: 'Pump', fields: [] },
              { name: 'Person', description: '0 properties', fields: [] },
            ]}
            selectedTypeName={selected}
            onClick={(item) => {
              alert(item.name);
              setSelected(item.name);
            }}
          />
        </div>
      </Group>
    </Wrapper>
  );
};
