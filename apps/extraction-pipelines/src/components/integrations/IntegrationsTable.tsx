import React, { FunctionComponent, useState } from 'react';
import { Colors } from '@cognite/cogs.js';
import styled from 'styled-components';
import Layers from 'utils/zindex';
import { bottomSpacing, mainContentSpaceAround } from 'styles/StyledVariables';
import { Integration } from 'model/Integration';
import ITable from 'components/table/ITable';
import { getIntegrationTableCol } from 'components/table/IntegrationTableCol';
import StyledTable from 'styles/StyledTable';
import FailMessageModal from 'components/form/viewEditIntegration/FailMessageModal';
import { Span3 } from 'styles/grid/StyledGrid';

const StyledIntegrationsTable = styled(StyledTable)`
  ${Span3};
  margin: ${mainContentSpaceAround};
  .cogs-input-container {
    margin-bottom: ${bottomSpacing};
  }
  .tableFixHead {
    overflow-y: auto;
    height: calc(100vh - 16.375rem);
    thead {
      th {
        position: sticky;
        top: 0;
      }
    }
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
  const [failMessageVisible, setFailMessageVisible] = useState(false);

  const openFailMessage = () => {
    setFailMessageVisible(true);
  };
  const closeFailMessage = () => {
    setFailMessageVisible(false);
  };
  return (
    <StyledIntegrationsTable>
      <ITable
        data={tableData}
        columns={getIntegrationTableCol(openFailMessage)}
      />
      <FailMessageModal
        onCancel={closeFailMessage}
        visible={failMessageVisible}
      />
    </StyledIntegrationsTable>
  );
};

export default IntegrationsTable;
