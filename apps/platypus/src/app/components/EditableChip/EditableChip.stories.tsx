import noop from 'lodash/noop';
import { useState } from 'react';
import { EditableChip } from './EditableChip';

export default {
  title: 'Basic components/EditableChip',
  component: EditableChip,
};

export const Base = () => {
  const [value, setValue] = useState<string>('my-movie-app');

  return (
    <EditableChip
      onChange={(newValue) => {
        setValue(newValue);
      }}
      value={value}
    />
  );
};

export const Locked = () => (
  <EditableChip onChange={noop} value="my-movie-app" isLocked />
);
export const WithPlaceholder = () => (
  <EditableChip onChange={noop} value={undefined} placeholder="Data model-ID" />
);
