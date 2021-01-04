import React, { FunctionComponent, useState } from 'react';
import { Colors } from '@cognite/cogs.js';
import { Column } from 'react-table';
import styled from 'styled-components';
import Layers from 'utils/zindex';
import { Integration } from '../../model/Integration';
import ITable from '../table/ITable';
import { getIntegrationTableCol } from '../table/IntegrationTableCol';
import StyledTable from '../../styles/StyledTable';
import FailMessageModal from '../form/viewEditIntegration/FailMessageModal';

const StyledIntegrationsTable = styled((props) => (
  <StyledTable {...props}>{props.children}</StyledTable>
))`
  .cogs-input-container {
    margin-bottom: 1rem;
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

  const [integration, setIntegration] = useState(tableData[0]);

  const openFailMessage = (row: Integration) => {
    setIntegration(row);
    setFailMessageVisible(true);
  };
  const closeFailMessage = () => {
    setFailMessageVisible(false);
  };
  return (
    <StyledIntegrationsTable>
      <ITable
        data={tableData}
        columns={
          getIntegrationTableCol(openFailMessage) as Column<Integration>[]
        }
      />
      <FailMessageModal
        onCancel={closeFailMessage}
        visible={failMessageVisible}
        integration={integration}
      />
    </StyledIntegrationsTable>
  );
};

export default IntegrationsTable;
