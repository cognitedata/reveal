import { useMemo } from 'react';
import { SegmentedControl } from '@cognite/cogs.js';
import { FilterLabel } from '../../Labels/FilterLabel';

export interface BooleanInputProps {
  label?: string;
  value?: boolean | undefined;
  onChange?: (newValue: boolean | undefined) => void;
}

export const BooleanInput = ({ label, value, onChange }: BooleanInputProps) => {
  const currentKey = useMemo(() => {
    if (value === undefined) {
      return 'unset';
    }
    if (value) {
      return 'true';
    }
    return 'false';
  }, [value]);

  const handleButtonClick = (key: string) => {
    if (key === 'unset') {
      onChange?.(undefined);
    } else if (key === 'true') {
      onChange?.(true);
    } else {
      onChange?.(false);
    }
  };

  return (
    <>
      {label && <FilterLabel>{label}</FilterLabel>}
      <SegmentedControl
        fullWidth
        currentKey={currentKey}
        onButtonClicked={handleButtonClick}
      >
        <SegmentedControl.Button
          key="unset"
          data-testid="unset"
          style={{ flex: 1 }}
        >
          All
        </SegmentedControl.Button>
        <SegmentedControl.Button
          key="true"
          data-testid="true"
          style={{ flex: 1 }}
        >
          True
        </SegmentedControl.Button>
        <SegmentedControl.Button
          key="false"
          data-testid="false"
          style={{ flex: 1 }}
        >
          False
        </SegmentedControl.Button>
      </SegmentedControl>
    </>
  );
};
