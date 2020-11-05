import React, { FunctionComponent } from 'react';
import styled from 'styled-components';
import { SelectedIntegrationProvider } from 'hooks/useSelectedIntegration';
import OverviewSidePanel from './OverviewSidePanel';
import IntegrationsTable from '../integrations/IntegrationsTable';

const IntegrationsWrapper = styled.div`
  border-left: 0.0625rem solid #e8e8e8; ;
`;
const TableWrapper = styled.div`
  margin: 1rem;
`;

interface OwnProps {}

type Props = OwnProps;

const OverviewTab: FunctionComponent<Props> = () => {
  return (
    <>
      <SelectedIntegrationProvider>
        <TableWrapper>
          <IntegrationsTable />
        </TableWrapper>
        <IntegrationsWrapper>
          <OverviewSidePanel />
        </IntegrationsWrapper>
      </SelectedIntegrationProvider>
    </>
  );
};

export default OverviewTab;
