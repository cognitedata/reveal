import { Input } from '@cognite/cogs.js';
import styled from 'styled-components';
import { FilterLabel } from '../../Labels/FilterLabel';

export const NumberInput = ({
  value,
  onChange,
  label,
  placeholder = 'Enter exact match...',
}: {
  label?: string;
  placeholder?: string;
  value?: number | undefined;
  onChange?: (newValue: number | undefined) => void;
}) => {
  const handleValueChange = (newValue: string | undefined) => {
    onChange?.(Number(newValue));
  };

  return (
    <>
      {label && <FilterLabel>{label}</FilterLabel>}

      <StyledInput
        type="number"
        variant="noBorder"
        fullWidth
        value={value || ''}
        placeholder={placeholder}
        onChange={(event) => {
          handleValueChange(event.target.value);
        }}
      />
    </>
  );
};

const StyledInput = styled(Input)`
  width: 100%;
`;
