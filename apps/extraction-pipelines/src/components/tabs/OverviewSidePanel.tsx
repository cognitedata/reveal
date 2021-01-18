import React, { FunctionComponent } from 'react';
import { Colors, Title } from '@cognite/cogs.js';
import styled from 'styled-components';
import { useSelectedIntegration } from '../../hooks/useSelectedIntegration';
import Monitoring from './Monitoring';
import NoIntegrationIsSelected from './NoIntegrationIsSelected';
import ContactInformation from '../ContactInformation/ContactInformation';
import { StyledTabs, StyledTabPane } from './StyledTabs';

const StyledOverviewSidePanel = styled.div`
  height: 100%;
  display: flex;
  flex-direction: column;
`;

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
    return <NoIntegrationIsSelected />;
  }
  return (
    <StyledOverviewSidePanel id={`side-panel-${integration.externalId}`}>
      <SidePanelHeading level={2}>{integration.name}</SidePanelHeading>
      <StyledTabs sidepaneltabs="true">
        <StyledTabPane tab="Monitoring" key="monitoring">
          <Monitoring externalId={integration.externalId} />
        </StyledTabPane>
        <StyledTabPane tab="Contact information" key="contacts">
          <ContactInformation contacts={integration.contacts} />
        </StyledTabPane>
      </StyledTabs>
    </StyledOverviewSidePanel>
  );
};

export default OverviewSidePanel;
