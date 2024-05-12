import { Flex, Icon, Menu, Radio } from '@cognite/cogs.js';
import { RuleAndEnabled } from '../types';

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
}: RuleBasedSelectionItemProps) => {
  return (
    <Menu.Item key={key}>
      <Flex justifyContent="space-between" alignItems="center" gap={8}>
        <Flex gap={4} alignItems="center">
          <Icon type="ColorPalette" />
          {label}
        </Flex>
        <Radio
          name={id ?? ''}
          value={id}
          checked={checked}
          onChange={(_: any, value: string | undefined) => {
            onChange(value);
          }}
        />
      </Flex>
    </Menu.Item>
  );
};
