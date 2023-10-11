import React from 'react';

import styled from 'styled-components';

import { Shortcut } from '@cognite/cogs.js';

type ToolTooltipProps = {
  label: string;
  keys: string[];
};

const ToolTooltip: React.FC<ToolTooltipProps> = ({ label, keys }) => {
  return (
    <Container key={label}>
      <Label>{label}</Label>{' '}
      <Shortcut keys={keys.map((key) => key.toUpperCase())} inverted />
    </Container>
  );
};

const Container = styled.div`
  display: flex;
  flex-direction: row;
`;

const Label = styled.div`
  margin-right: 4px;
`;

export default ToolTooltip;
