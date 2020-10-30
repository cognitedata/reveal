import React, { FunctionComponent } from 'react';
import styled from 'styled-components';
import { Table } from 'antd';
import { mockResponse } from '../../utils/mockResponse';
import { Integration } from '../../model/Integration';
import { integrationColumns } from './cols/IntegrationsTableCols';

const StyledTable = styled((props) => <Table {...props} />)`
  .ant-table-thead {
    tr {
      th {
        background-color: #fff;
      }
    }
  }
`;

interface OwnProps {}

type Props = OwnProps;
const IntegrationsTable: FunctionComponent<Props> = () => {
  return (
    <>
      <StyledTable
        dataSource={mockResponse}
        columns={integrationColumns}
        rowKey={(s: Integration) => s.name}
      />
    </>
  );
};

export default IntegrationsTable;
