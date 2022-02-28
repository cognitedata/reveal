import { Input } from '@cognite/cogs.js';
import { useRef, useState } from 'react';
import { useComponentName } from 'scarlet/hooks';
import { EquipmentComponent } from 'scarlet/types';

type ComponentToRenameProps = {
  component: EquipmentComponent;
  onChange: (id: string, value?: string) => void;
  groupLabel: string;
};

export const ComponentToRename = ({
  component,
  onChange,
  groupLabel,
}: ComponentToRenameProps) => {
  const getComponentName = useComponentName();
  const initialValue = useRef(getComponentName(component)).current;
  const [value, setValue] = useState<string>(initialValue);
  const isError = value.trim() === '';

  return (
    <>
      <Input
        isValid={value.trim() !== initialValue && value.trim() !== ''}
        name={component.id}
        className={isError ? 'has-error' : undefined}
        fullWidth
        value={value}
        onChange={(e) => {
          const { value } = e.target;
          setValue(value);
          onChange(
            component.id,
            value.trim() === initialValue ? undefined : value.trim()
          );
        }}
      />
      {isError && (
        <div className="error-space">{`Invalid ${groupLabel} name`}</div>
      )}
    </>
  );
};
