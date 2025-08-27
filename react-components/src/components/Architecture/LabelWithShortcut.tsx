import React from 'react';

import styled from 'styled-components';

import { Shortcut } from '@cognite/cogs.js';
import { type BaseCommand } from '../../architecture/base/commands/BaseCommand';

type LabelWithShortcutProps = {
  label?: string;
  command?: BaseCommand;
  inverted?: boolean;
};

export const LabelWithShortcut: React.FC<LabelWithShortcutProps> = ({
  label,
  command,
  inverted = true
}) => {
  if (label === undefined) {
    return <></>;
  }
  const keys = command?.getShortCutKeys();
  return (
    <Container key={label}>
      <Label>{label}</Label>
      {keys !== undefined && <Shortcut keys={keys} inverted={inverted} />}
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
