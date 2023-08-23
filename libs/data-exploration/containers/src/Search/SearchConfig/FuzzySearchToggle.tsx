import * as React from 'react';

import { Switch, Tooltip } from '@cognite/cogs.js';

import { useTranslation } from '@data-exploration-lib/core';

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
  const { t } = useTranslation();
  if (!visible) {
    return null;
  }

  return (
    <ModalSwitchContainer data-testid="fuzzy-search-toggle">
      <Tooltip content={t('FUZZY_SEARCH', 'Fuzzy search')} placement="right">
        <Switch
          size="tiny"
          checked={enabled}
          onChange={(_: unknown, nextState) => onChange(!!nextState)}
        />
      </Tooltip>
    </ModalSwitchContainer>
  );
};
