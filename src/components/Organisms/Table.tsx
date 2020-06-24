import React from 'react';
import styled from 'styled-components';

type TableProps = {
  dataSource: {
    key: React.Key;
    options?: {
      icon?: JSX.Element;
      expandable?: boolean;
    };
    actions?: JSX.Element[];
    [propName: string]: any;
  }[];
  columns: {
    title: string;
    dataIndex: string;
    key: React.Key;
    render?: () => JSX.Element;
  }[];
};

const CogTable = styled.table`
  font-family: 'Inter', sans-serif;
  font-size: 14px;
  width: 100%;
  border-collapse: collapse;
  box-sizing: border-box;
  th {
    font-weight: 600;
    text-align: left;
    border-bottom: 1px solid var(--cogs-greyscale-grey4);
    padding: 22px;
  }
  td {
    font-weight: 500;
    padding: 22px;
    border-bottom: 1px solid var(--cogs-greyscale-grey4);
    vertical-align: center;
  }
`;

const Table = ({ dataSource, columns }: TableProps) => {
  return (
    <CogTable>
      <thead>
        <tr>
          <th>icon</th>
          {columns.map((column) => (
            <th key={column.key}>{column.title}</th>
          ))}
          <th>actions</th>
        </tr>
      </thead>
      <tbody>
        {dataSource.map((data) => (
          <React.Fragment key={data.key}>
            <tr>
              <td>{data?.options?.icon && data?.options?.icon}</td>
              {columns.map((column) => (
                <td key={column.key}>
                  {column.render ? column.render() : data[column.dataIndex]}
                </td>
              ))}
              <td>{data?.actions?.map((action) => action)}</td>
            </tr>
            {data?.options?.expandable && (
              <tr>
                <td colSpan={columns.length + 2}>This is expandable data</td>
              </tr>
            )}
          </React.Fragment>
        ))}
      </tbody>
    </CogTable>
  );
};

export default Table;
