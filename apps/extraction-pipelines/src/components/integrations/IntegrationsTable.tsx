import React, { FunctionComponent } from 'react';
import { Loader } from '@cognite/cogs.js';
import { Column } from 'react-table';
import styled from 'styled-components';
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
import StyledTable from '../../styles/StyledTable';

const StyledIntegrationsTable = styled((props) => (
  <StyledTable {...props}>{props.children}</StyledTable>
))`
  table {
    thead,
    tbody {
      display: block;
    }
    tbody {
      overflow: auto;
      height: auto;
      max-height: 68vh;
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
    <StyledIntegrationsTable>
      <ITable
        data={tableData}
        columns={getIntegrationTableCol() as Column<Integration>[]}
      />
    </StyledIntegrationsTable>
  );
};

export default IntegrationsTable;
