import React, { FunctionComponent } from 'react';
import { Colors, Title } from '@cognite/cogs.js';
import styled from 'styled-components';
import { useSelectedIntegration } from '../../hooks/useSelectedIntegration';
import SidePanelTable from './SidePanelTable';
import { StyledSidePanelTabs, StyledTabPane } from './TabsStyle';

const SidePanelHeading = styled((props) => (
  <Title {...props}>{props.children}</Title>
))`
  text-align: left;
  padding: 1rem 1.375rem;
  margin: 0 0 0.875rem;
  background-color: ${Colors['midblue-7'].hex()};
  font-size: 1.5rem;
  position: relative;
  &::after {
    content: '';
    border-left: 0.875rem solid transparent;
    border-right: 0.875rem solid transparent;
    border-top: 0.875rem solid ${Colors['midblue-7'].hex()};
    position: absolute;
    bottom: -0.875rem;
    left: 1.12rem;
  }
`;

interface OwnProps {}

type Props = OwnProps;
const OverviewSidePanel: FunctionComponent<Props> = () => {
  const { integration } = useSelectedIntegration();
  if (!integration) {
    return <></>;
  }
  return (
    <>
      <SidePanelHeading level={2}>{integration.name}</SidePanelHeading>
      <StyledSidePanelTabs>
        <StyledTabPane tab="Monitoring" key="monitoring">
          <SidePanelTable />
        </StyledTabPane>
        <StyledTabPane tab="Contacts" key="contacts">
          Contacts
        </StyledTabPane>
      </StyledSidePanelTabs>
    </>
  );
};

export default OverviewSidePanel;
