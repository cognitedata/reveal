import React, { FunctionComponent } from 'react';
import styled from 'styled-components';
import { Colors, Loader } from '@cognite/cogs.js';
import { Column } from 'react-table';
import ITable from '../table/ITable';
import { getIntegrationTableCol } from '../table/IntegrationTableCol';
import { Integration } from '../../model/Integration';
import { useIntegrations } from '../../hooks/useIntegrations';
import { useDataSets } from '../../hooks/useDataSets';
import {
  mapDataSetToIntegration,
  mapUniqueDataSetIds,
} from '../../utils/dataSetUtils';
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
  const {
    data,
    isLoading: isLoadingIntegrations,
    error: errorIntegrations,
  } = useIntegrations();
  const dataSetIds = mapUniqueDataSetIds(data);
  const { isLoading, data: dataSets } = useDataSets(dataSetIds);
  let tableData = data ?? [];

  if (isLoading || isLoadingIntegrations) {
    return <Loader />;
  }

  if (errorIntegrations) {
    return <ErrorFeedback error={errorIntegrations} />;
  }

  if (dataSets) {
    tableData = mapDataSetToIntegration(data, dataSets);
  }
  return (
    <Wrapper>
      <ITable
        data={tableData}
        columns={getIntegrationTableCol() as Column<Integration>[]}
      />
    </Wrapper>
  );
};

export default IntegrationsTable;
