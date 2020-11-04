import React, { FunctionComponent } from 'react';
import styled from 'styled-components';
import { Colors } from '@cognite/cogs.js';
import { mockResponse } from '../../utils/mockResponse';
import ITable from '../table/ITable';
import { getIntegrationTableCol } from '../table/IntegrationTableCol';

const Wrapper = styled.div`
  .cogs-table {
    border-spacing: 0;
    border-collapse: collapse;
    thead {
      tr {
        border-bottom: ${Colors['greyscale-grey3'].hex()};
        th {
          background-color: white;
          &:last-child {
            width: 3rem;
          }
          &:first-child {
            width: 3rem;
          }
        }
      }
    }
    tbody {
      tr {
        &:nth-child(2n) {
          background-color: white;
          &:hover {
            background-color: ${Colors['greyscale-grey2'].hex()};
          }
        }
        &.row-active {
          background-color: ${Colors['midblue-7'].hex()};
          &:hover {
            background-color: ${Colors['greyscale-grey2'].hex()};
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
  return (
    <Wrapper>
      <ITable data={mockResponse} columns={getIntegrationTableCol()} />
    </Wrapper>
  );
};

export default IntegrationsTable;
