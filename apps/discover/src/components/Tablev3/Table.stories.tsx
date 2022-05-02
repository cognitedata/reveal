import { useState } from 'react';
import { Row } from 'react-table';

import { Table } from '.';
import { Options, TableResults } from './types';

type Example = {
  id: number;
  col1?: number;
  col2?: string;
  col3?: string;
};

const dummyData: Example[] = [
  {
    id: 5,
    col1: 1,
    col2: 'Label',
    // eslint-disable-next-line no-multi-str
    col3: 'Lorem ipsum dolor sit amet consectetur adipisicing elit \
              Corrupti aperiam dolore quo quidem facilis expedita odit \
              sed asperiores quos eaque ipsam eligendi laborum, delectus, \
              reiciendis aut dolorem error molestiae nulla?',
  },
  {
    id: 6,
    col1: 2,
    col2: 'Label',
    // eslint-disable-next-line no-multi-str
    col3: 'In our complex multi-screen world, designers need tools to scale \
                their process quickly. Tech companies are competing on the \
                strength of their user experience and as their design headcount \
                increases, they face issues of consistency, communication and \
                execution.',
  },
];

const columns = [
  {
    Header: 'Column 1',
    accessor: 'col1',
  },
  {
    Header: 'Column 2',
    accessor: 'col2',
  },
  {
    Header: 'Column 3',
    accessor: 'col3',
    width: '30%',
  },
];

const tableOptionsBasic: Options = {
  height: '100%',
  flex: false,
  hideScrollbars: true,
};

export const basic = () => {
  return (
    <Table<Example>
      id="new-table-basic"
      data={dummyData}
      columns={columns}
      options={tableOptionsBasic}
    />
  );
};

const tableOptionsExpandable: Options = {
  height: '100%',
  flex: false,
  hideScrollbars: true,
  expandable: true,
};

export const Expandable = () => {
  const [expanded, setExpanded] = useState<TableResults>({});

  const renderSubComponent = () => {
    return <div>Sub-component placeholder</div>;
  };

  const onRowHandleClick = (rowElement: Row) => {
    const { id } = rowElement.original as Example;
    setExpanded({ ...expanded, [`${id}`]: !expanded[`${id}`] });
  };

  return (
    <Table<Example>
      id="new-table-collapsible"
      data={dummyData}
      columns={columns}
      renderRowSubComponent={renderSubComponent}
      handleRowClick={onRowHandleClick}
      options={tableOptionsExpandable}
      expandedIds={expanded}
    />
  );
};

const tableOptionsCheckable: Options = {
  height: '100%',
  flex: false,
  hideScrollbars: true,
  checkable: true,
};

export const checkable = () => {
  return (
    <Table<Example>
      id="new-table-checkable"
      data={dummyData}
      columns={columns}
      options={tableOptionsCheckable}
    />
  );
};

// eslint-disable-next-line import/no-anonymous-default-export
export default {
  title: 'shared|_components/table',
  component: Table,
};
