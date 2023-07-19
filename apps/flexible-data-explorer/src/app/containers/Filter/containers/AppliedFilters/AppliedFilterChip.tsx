import { Chip } from '@cognite/cogs.js';

import { useTranslation } from '../../../../hooks/useTranslation';
import { FieldValue } from '../../types';

import { getChipLabel } from './utils';

export interface AppliedFilterChipProps {
  dataType?: string;
  field: string;
  fieldValue: FieldValue;
  onRemove: (field: string) => void;
}

export const AppliedFilterChip: React.FC<AppliedFilterChipProps> = ({
  dataType,
  field,
  fieldValue,
  onRemove,
}) => {
  const { t } = useTranslation();

  const label = getChipLabel({
    dataType,
    field,
    fieldValue,
    t,
  });

  return (
    <Chip
      key={label}
      type="neutral"
      label={label}
      onRemove={() => onRemove(field)}
    />
  );
};
