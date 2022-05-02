import { useState } from 'react';

import { Dropdown, Menu } from '@cognite/cogs.js';

import { ExpandButton } from 'components/Buttons';

import { SelectorWrapper } from './elements';

export type ValueSelection = {
  id: number;
  value: string;
  title?: string;
  default?: boolean;
};

type Props = {
  selections: ValueSelection[];
  onChange?: (value: string) => void;
  label?: string;
  showOutline?: boolean;
};

export const ValueSelector: React.FC<Props> = ({
  selections,
  onChange,
  label = '',
  showOutline = false,
}) => {
  const [selected, setSelected] = useState<ValueSelection>(
    selections.find((row) => row.default) as ValueSelection
  );

  const extendedSelections = selections.map((selection) => ({
    ...selection,
    title: selection.title || selection.value,
  }));

  const selectHandle = (item: ValueSelection) => {
    setSelected(item);
    if (onChange) {
      onChange(item.value);
    }
  };

  return (
    <SelectorWrapper showOutline={showOutline}>
      {label && <span>{label} : </span>}
      <Dropdown
        content={
          <Menu>
            {extendedSelections.map((item) => (
              <Menu.Item
                onClick={() => {
                  selectHandle(item);
                }}
                key={item.id}
              >
                {item.title}
              </Menu.Item>
            ))}
          </Menu>
        }
      >
        <ExpandButton text={selected.title} />
      </Dropdown>
    </SelectorWrapper>
  );
};

export default ValueSelector;
