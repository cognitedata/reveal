/*!
 * Copyright 2024 Cognite AS
 */
import { ColorPaletteIcon, Flex, LoaderIcon } from '@cognite/cogs.js';
import { Menu } from '@cognite/cogs-lab';
import { type ReactElement } from 'react';
import styled from 'styled-components';

type RuleBasedSelectionItemProps = {
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
      onClick={() => {
        onChange(id);
      }}
      label={label}
      toggled={checked}
      key={key}
      trailingContent={
        <StyledFlex justifyContent="space-between" alignItems="center" gap={8}>
          {!isEmptyRuleItem && isLoading && checked === true && <LoaderIcon />}
          <Flex gap={4} alignItems="center">
            <ColorPaletteIcon />
          </Flex>
        </StyledFlex>
      }></Menu.ItemToggled>
  );
};

const StyledFlex = styled(Flex)`
  min-height: 24px;
`;
