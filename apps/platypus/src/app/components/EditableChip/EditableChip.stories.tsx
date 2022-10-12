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

export const Locked = () => <EditableChip value="my-movie-app" isLocked />;
export const WithPlaceholder = () => (
  <EditableChip value={undefined} placeholder="Data model-ID" />
);
