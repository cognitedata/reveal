import React, { FunctionComponent } from 'react';
import styled from 'styled-components';
import { Colors, Loader } from '@cognite/cogs.js';
import { Column } from 'react-table';
import ITable from '../table/ITable';
import { getIntegrationTableCol } from '../table/IntegrationTableCol';
import { Integration } from '../../model/Integration';
import { useIntegrations } from '../../hooks/useIntegrations';
import { ErrorFeedback } from '../error/ErrorFeedback';

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
  const { data, isLoading, error } = useIntegrations();
  if (isLoading) {
    return <Loader />;
  }
  if (error) {
    return <ErrorFeedback error={error} />;
  }
  if (data) {
    return (
      <Wrapper>
        <ITable
          data={data}
          columns={getIntegrationTableCol() as Column<Integration>[]}
        />
      </Wrapper>
    );
  }
  return <></>;
};

export default IntegrationsTable;
