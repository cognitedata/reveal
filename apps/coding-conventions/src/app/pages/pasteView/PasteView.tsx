import React from 'react';
import styled from 'styled-components/macro';
import { Table } from './DataCleanupComponent';

const Styles = styled.div`
  padding: 1rem;
  table {
    height: 200px;
    border-spacing: 0;
    border: 1px solid black;
    tr {
      :last-child {
        td {
          border-bottom: 0;
        }
      }
    }
    th,
    td {
      margin: 0;
      padding: 0.5rem;
      border-bottom: 1px solid black;
      border-right: 1px solid black;
      :last-child {
        border-right: 0;
      }
    }
  }
  table,
  pre {
    float: left;
  }
`;

export const PasteView = () => {
  const columns = React.useMemo(
    () => [
      {
        Header: 'System',
        columns: [
          {
            Header: 'First Name',
            accessor: 'firstName',
          },
          {
            Header: 'Last Name',
            accessor: 'lastName',
          },
        ],
      },
      {
        Header: 'SubSystem',
        columns: [
          {
            Header: 'Age',
            accessor: 'age',
          },
          {
            Header: 'Visits',
            accessor: 'visits',
          },
        ],
      },
    ],
    []
  );

  const data = React.useMemo(() => {
    const emptyRows = [];
    for (let i = 0; i < 20; i++) {
      emptyRows.push({});
    }
    return emptyRows;
  }, []);

  return (
    <Styles>
      <Table columns={columns} data={data} />
    </Styles>
  );
};
