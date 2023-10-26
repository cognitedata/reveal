import { useState, useMemo } from 'react';

import groupBy from 'lodash/groupBy';
import map from 'lodash/map';
import uniqBy from 'lodash/uniqBy';

import { units } from '@cognite/charts-lib';
import { Select, Button, SelectProps } from '@cognite/cogs.js';

export const UnitSelector = ({
  value,
  onChange,
  ...rest
}: Omit<SelectProps<string>, 'options'>) => {
  const [input, setInput] = useState<string | undefined>();
  const [open, setOpen] = useState<boolean>(false);
  const optionsWithCustomValue = useMemo(() => {
    return map(
      groupBy(value ? uniqBy([value, ...units], 'value') : units, 'type'),
      (unitGroup, groupLabel) => ({
        label: groupLabel,
        options: unitGroup,
      })
    );
  }, [value]);

  const handleCreateCustomUnitClick = () => {
    if (!input) {
      return;
    }
    onChange({ value: input, label: input, type: 'Custom' });
    setInput('');
    setOpen(false);
  };

  return (
    <Select<string>
      placeholder="Select or Create custom unit"
      onInputChange={setInput}
      // todo(DEGR-2397) check if this is working in new select
      // eslint-disable-next-line @typescript-eslint/ban-ts-comment
      // @ts-ignore No idea why is it not accepting a React Element
      menuHeader={
        <Button type="primary" onClick={handleCreateCustomUnitClick}>
          {input
            ? `Create custom unit: ${input}`
            : 'Type to create custom unit'}
        </Button>
      }
      menuPortalTarget={document.body}
      onChange={onChange}
      inputValue={input}
      value={value}
      onMenuOpen={() => setOpen(true)}
      onMenuClose={() => setOpen(false)}
      title={input ? 'Search' : value?.type}
      menuIsOpen={open}
      {...rest}
      options={optionsWithCustomValue}
    />
  );
};
