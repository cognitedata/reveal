import {
  Wrapper,
  MainTitle,
  MainDescription,
  GroupTitle,
  Group,
} from '@platypus-app/components/Styles/storybook';
import { CogDataGrid, GridConfig } from '@cognite/cog-data-grid';
import { useState } from 'react';
import { TypeList } from '../components/TypeList/TypeList';

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
