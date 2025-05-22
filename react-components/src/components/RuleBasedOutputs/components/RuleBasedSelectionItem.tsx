/*!
 * Copyright 2024 Cognite AS
 */
import { ColorPaletteIcon, Flex, LoaderIcon } from '@cognite/cogs.js';
import { Menu } from '@cognite/cogs-lab';
import { type ReactElement } from 'react';
import styled from 'styled-components';

export type RuleBasedSelectionItemProps = {
  onChange: (value: string | undefined) => void;
  label: string;
  id: string;
  checked: boolean | undefined;
  key: string;
  isLoading: boolean;
  isEmptyRuleItem: boolean;
};
export const RuleBasedSelectionItem = ({
  onChange,
  label,
  key,
  id,
  checked,
  isLoading,
  isEmptyRuleItem
}: RuleBasedSelectionItemProps): ReactElement => {
  return (
    <Menu.ItemToggled
      data-testid="rule-based-selection-item"
      onClick={() => {
        onChange(id);
      }}
      label={label}
      toggled={checked}
      key={key}
      trailingContent={
        <StyledFlex justifyContent="space-between" alignItems="center" gap={8}>
          {!isEmptyRuleItem && isLoading && checked === true && (
            <LoaderIcon data-testid="rule-based-loader-icon" />
          )}
          <RightFlex gap={4} alignItems="center">
            <ColorPaletteIcon data-testid="rule-based-color-pallete-icon" />
          </RightFlex>
        </StyledFlex>
      }></Menu.ItemToggled>
  );
};

const StyledFlex = styled(Flex)`
  min-height: 24px;
`;

const RightFlex = styled(Flex)`
  padding-right: 4px;
`;
