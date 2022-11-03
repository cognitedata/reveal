import { useState } from 'react';
import { EditableChip } from './EditableChip';

export default {
  title: 'Basic components/EditableChip',
  component: EditableChip,
};

export const Base = () => {
  const [value, setValue] = useState<string>('my-movie-app');

  return (
    <div style={{ width: '200px' }}>
      <EditableChip
        onChange={(newValue) => {
          setValue(newValue);
        }}
        value={value}
      />
    </div>
  );
};

export const Locked = () => <EditableChip value="my-movie-app" isLocked />;

export const WithLongValue = () => (
  <div style={{ width: '200px' }}>
    <EditableChip value="e0a265c9-906e-43c1-91ab-29b4b4fc52c" isLocked />
  </div>
);

export const WithPlaceholder = () => (
  <EditableChip value={undefined} placeholder="Data model-ID" />
);

export const WithTooltip = () => (
  <EditableChip
    tooltip="Lorem ipsum"
    value="my-movie-app"
    placeholder="Data model-ID"
  />
);

export const WithValidation = () => {
  const [value, setValue] = useState<string>('my-movie-app');

  return (
    <div style={{ width: '200px' }}>
      <p>Validate that the value does not include the character "1".</p>
      <EditableChip
        errorMessage='Cannot contain the character "1"'
        onChange={(newValue) => {
          setValue(newValue);
        }}
        validate={(v) => !v.includes('1')}
        value={value}
      />
    </div>
  );
};
