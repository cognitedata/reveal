import { Input } from '@cognite/cogs.js';
import debounce from 'lodash/debounce';
import React from 'react';

interface Props {
  onChange(value: string): void;
}

export const NameFilter: React.FC<Props> = ({ onChange }) => {
  const onChangeDebounced = React.useMemo(
    () => debounce(onChange, 300),
    [onChange]
  );

  return (
    <Input
      icon="Search"
      placeholder="Search"
      onChange={(event) => onChangeDebounced(event.target.value)}
    />
  );
};
