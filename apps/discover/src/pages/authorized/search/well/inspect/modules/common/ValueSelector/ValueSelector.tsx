import { useState } from 'react';

import { ExpandButton } from 'components/buttons';
import { Dropdown } from 'components/dropdown';

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

  const selectHandle = (_e: React.MouseEvent, item: ValueSelection) => {
    setSelected(item);
    if (onChange) {
      onChange(item.value);
    }
  };

  return (
    <SelectorWrapper showOutline={showOutline}>
      {label && <span>{label} : </span>}
      <Dropdown
        handleChange={selectHandle}
        selected={{ ...selected }}
        items={extendedSelections}
        displayField="title"
        valueField="id"
        menuStyle={{ marginTop: '60px' }}
      >
        <ExpandButton text={selected.title} />
      </Dropdown>
    </SelectorWrapper>
  );
};

export default ValueSelector;
