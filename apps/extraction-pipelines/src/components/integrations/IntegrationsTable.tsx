import React, { FunctionComponent } from 'react';
import { Loader } from '@cognite/cogs.js';
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
import Wrapper from '../../styles/TablesStyle';

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
