/*!
 * Copyright 2024 Cognite AS
 */
import { ColorPaletteIcon, Flex, Menu, Radio } from '@cognite/cogs.js';
import { type ReactElement } from 'react';

type RuleBasedSelectionItemProps = {
  onChange: (value: string | undefined) => void;
  label: string;
  id: string;
  checked: boolean | undefined;
  key: string;
};
export const RuleBasedSelectionItem = ({
  onChange,
  label,
  key,
  id,
  checked
}: RuleBasedSelectionItemProps): ReactElement => {
  return (
    <Menu.Item
      onClick={() => {
        onChange(id);
      }}
      key={key}>
      <Flex justifyContent="space-between" alignItems="center" gap={8}>
        <Flex gap={4} alignItems="center">
          <ColorPaletteIcon />
          {label}
        </Flex>
        <Radio name={id ?? ''} value={id} checked={checked} />
      </Flex>
    </Menu.Item>
  );
};
