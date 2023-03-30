import { useMemo } from 'react';
import { SegmentedControl, Tooltip } from '@cognite/cogs.js';
import { FilterLabel } from '../../Labels/FilterLabel';

export interface BooleanInputProps {
  label?: string;
  value?: boolean | undefined;
  onChange?: (newValue: boolean | undefined) => void;
  error?: boolean;
  loading?: boolean;
}

export const BooleanInput = ({
  label,
  value,
  onChange,
  error,
  loading,
}: BooleanInputProps) => {
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

  if (loading) {
    return (
      <>
        {label && <FilterLabel>{label}</FilterLabel>}
        <SegmentedControl skeleton fullWidth>
          {/* Added Placeholder items for skeleton to work. */}
          <SegmentedControl.Button key="1">Placeholder</SegmentedControl.Button>
          <SegmentedControl.Button key="2">Placeholder</SegmentedControl.Button>
        </SegmentedControl>
      </>
    );
  }

  return (
    <>
      {label && <FilterLabel>{label}</FilterLabel>}
      <Tooltip interactive disabled={!error} content="No data found">
        <SegmentedControl
          fullWidth
          currentKey={currentKey}
          onButtonClicked={handleButtonClick}
          disabled={error}
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
      </Tooltip>
    </>
  );
};
