import React, { FunctionComponent } from 'react';
import { Colors } from '@cognite/cogs.js';
import styled from 'styled-components';
import Layers from 'utils/zindex';
import { bottomSpacing, mainContentSpaceAround } from 'styles/StyledVariables';
import { Integration } from 'model/Integration';
import ITable from 'components/table/ITable';
import { integrationTableColumns } from 'components/table/IntegrationTableCol';
import StyledTable from 'styles/StyledTable';
import { Span3 } from 'styles/grid/StyledGrid';

const StyledIntegrationsTable = styled(StyledTable)`
  ${Span3};
  margin: ${mainContentSpaceAround};
  .cogs-input-container {
    margin-bottom: ${bottomSpacing};
  }

  table {
    border-collapse: collapse;
    width: 100%;
    th,
    td {
      padding: 0.5rem 1rem;
    }
    th {
      background: ${Colors.white.hex()};
      z-index: ${Layers.MINIMUM};
    }
  }
`;

interface OwnProps {
  tableData: Integration[];
}

type Props = OwnProps;
const IntegrationsTable: FunctionComponent<Props> = ({
  tableData,
}: OwnProps) => {
  return (
    <StyledIntegrationsTable>
      <ITable data={tableData} columns={integrationTableColumns} />
    </StyledIntegrationsTable>
  );
};

export default IntegrationsTable;
