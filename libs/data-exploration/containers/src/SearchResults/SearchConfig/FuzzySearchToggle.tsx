import * as React from 'react';

import { Switch, Tooltip } from '@cognite/cogs.js';

import { ModalSwitchContainer } from './elements';

export interface FuzzySearchToggleProps {
  visible: boolean;
  enabled: boolean;
  onChange: (nextState: boolean) => void;
}

export const FuzzySearchToggle: React.FC<FuzzySearchToggleProps> = ({
  visible,
  enabled,
  onChange,
}) => {
  if (!visible) {
    return null;
  }

  return (
    <ModalSwitchContainer>
      <Tooltip content="Fuzzy search" placement="right">
        <Switch
          size="tiny"
          checked={enabled}
          onChange={(_: unknown, nextState: boolean) => onChange(nextState)}
        />
      </Tooltip>
    </ModalSwitchContainer>
  );
};
