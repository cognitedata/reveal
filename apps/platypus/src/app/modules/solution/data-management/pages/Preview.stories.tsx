import {
  Wrapper,
  MainTitle,
  MainDescription,
  GroupTitle,
  Group,
} from '@platypus-app/components/Styles/storybook';
import { CogDataGrid, TableType } from '@cognite/cog-data-grid';
import { useState } from 'react';
import { TypeList } from '../components/TypeList/TypeList';

const configMock = {
  columns: [
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
  customFunctions: [],
  dataSources: [],
};

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

const DataGridComponent = ({ type }: { type: TableType }) => {
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
  const onGridReady = (e: any) => {
    console.log('grid ready', e);
  };

  return (
    <div style={{ height: '100%' }}>
      <CogDataGrid
        data={responseMock}
        tableType={type}
        config={configMock}
        onCellValueChanged={onCellValueChanged}
        onGridReady={onGridReady}
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
        <DataGridComponent type={'default'} />
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
        <DataGridComponent type={'large'} />
      </div>
    </Group>
  </Wrapper>
);

export const TypeListPreview = () => (
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
          items={[
            { name: 'System', description: '7 properties', fields: [] },
            { name: 'Well', description: '5 properties', fields: [] },
            { name: 'Pump', fields: [] },
            { name: 'Person', description: '0 properties', fields: [] },
          ]}
          onClick={(item: any) => alert(item.title)}
        />
      </div>
    </Group>
  </Wrapper>
);
