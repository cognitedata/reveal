import React, { FunctionComponent } from 'react';
import { Colors, Title } from '@cognite/cogs.js';
import styled from 'styled-components';
import { useSelectedIntegration } from '../../hooks/useSelectedIntegration';

const SidePanelHeading = styled((props) => (
  <Title {...props}>{props.children}</Title>
))`
  text-align: left;
  padding: 1rem 1.375rem;
  margin: 0;
  background-color: ${Colors['midblue-7'].hex()};
  font-size: 1.5rem;
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
    </>
  );
};

export default OverviewSidePanel;
