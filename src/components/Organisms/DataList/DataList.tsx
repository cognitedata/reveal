import React from 'react';
import styled from 'styled-components';
import { colors } from '../../../global-styles';
import { Data } from '../../../pages/Configurations/Configurations';

const Table = styled.table`
  font-family: 'Inter', sans-serif;
  font-size: 14px;
  font-weight: 500;
  font-style: normal;
  text-align: left;
  width: 100%;
  border-collapse: collapse;
  thead {
    font-size: 16px;
    font-weight: 600;
    th {
      border-bottom: 1px solid ${colors.grey4};
      padding: 20px 16px;
    }
  }
  tr:not(:last-child) {
    border-bottom: 1px solid ${colors.grey4};
  }
  td {
    padding: 20px 16px;
  }
`;

type DataListProps = {
  data: Data;
};

const DataList = ({ data }: DataListProps) => {
  const { headers, rows } = data;
  return (
    <Table>
      <thead>
        <tr>
          {headers.map((header) => (
            <th>{header}</th>
          ))}
        </tr>
      </thead>
      <tbody>
        {rows.map((row) => (
          <tr>
            {row.map((cell) => (
              <td>{cell}</td>
            ))}
          </tr>
        ))}
      </tbody>
    </Table>
  );
};

export default DataList;
