import React, { FunctionComponent } from 'react';
import styled from 'styled-components';
import { SelectedIntegrationProvider } from 'hooks/useSelectedIntegration';
import { Colors } from '@cognite/cogs.js';
import OverviewSidePanel from './OverviewSidePanel';
import IntegrationsTable from '../integrations/IntegrationsTable';

const IntegrationsWrapper = styled.div`
  border-left: 0.0625rem solid #e8e8e8;
`;
const TableWrapper = styled.div`
  margin: 1rem;
`;
const StyledOverview = styled((props) => (
  <div {...props}>{props.children}</div>
))`
  grid-area: main;
  display: grid;
  grid-template-columns: auto 25rem;
  padding: 0;
  border-top: 0.0625rem solid ${Colors['greyscale-grey3'].hex()};
`;
interface OwnProps {}

type Props = OwnProps;

const OverviewTab: FunctionComponent<Props> = () => {
  return (
    <StyledOverview>
      <SelectedIntegrationProvider>
        <TableWrapper>
          <IntegrationsTable />
        </TableWrapper>
        <IntegrationsWrapper>
          <OverviewSidePanel />
        </IntegrationsWrapper>
      </SelectedIntegrationProvider>
    </StyledOverview>
  );
};

export default OverviewTab;
