/*!
 * Copyright 2023 Cognite AS
 */
import React from 'react';

import styled from 'styled-components';

import { Shortcut } from '@cognite/cogs.js';

type LabelWithShortcutProps = {
  label: string;
  shortcut?: string;
};

export const LabelWithShortcut: React.FC<LabelWithShortcutProps> = ({ label, shortcut }) => {
  return (
    <Container key={label}>
      <Label>{label}</Label>
      {shortcut !== undefined && <Shortcut keys={[shortcut]} inverted />}
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
