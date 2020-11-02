import React, { FunctionComponent } from 'react';
import styled from 'styled-components';
import { Colors } from '@cognite/cogs.js';
import { mockResponse } from '../../utils/mockResponse';
import { useIntegrationTableCol } from '../../hooks/useIntegrationTableCol';
import { useIntegrationTableDataSource } from '../../hooks/useIntegrationTableDataSource';
import ITable from '../table/ITable';

const Wrapper = styled.div`
  .cogs-table {
    border-spacing: 0;
    border-collapse: collapse;
    thead {
      tr {
        border-bottom: ${Colors['greyscale-grey3'].hex()};
        th {
          background-color: white;
        }
      }
    }
    tbody {
      tr {
        &:hover {
          background-color: ${Colors['midblue-7'].hex()};
        }
        &:nth-child(2n) {
          background-color: white;
          &:hover {
            background-color: ${Colors['midblue-7'].hex()};
          }
        }
        td {
          padding: 0.75rem;
        }
      }
    }
  }
`;

interface OwnProps {}

type Props = OwnProps;
const IntegrationsTable: FunctionComponent<Props> = () => {
  const data = useIntegrationTableDataSource(mockResponse);
  const columns = useIntegrationTableCol();
  return (
    <Wrapper>
      <ITable data={data} columns={columns} />
    </Wrapper>
  );
};

export default IntegrationsTable;
