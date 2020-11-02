import React, { FunctionComponent } from 'react';
import { Title } from '@cognite/cogs.js';
import styled from 'styled-components';

const SidePanelHeading = styled((props) => (
  <Title {...props}>{props.children}</Title>
))`
  text-align: left;
  padding: 1rem 1.375rem;
  margin: 0;
  background-color: #e8e8e8;
  font-size: 1.5rem;
`;

interface OwnProps {}

type Props = OwnProps;
const OverviewSidePanel: FunctionComponent<Props> = () => {
  return <SidePanelHeading level={2}>Heading Placeholder</SidePanelHeading>;
};

export default OverviewSidePanel;
