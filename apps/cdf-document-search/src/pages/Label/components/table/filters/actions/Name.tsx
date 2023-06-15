import React from 'react';

import debounce from 'lodash/debounce';

import { Input } from '@cognite/cogs.js';

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
