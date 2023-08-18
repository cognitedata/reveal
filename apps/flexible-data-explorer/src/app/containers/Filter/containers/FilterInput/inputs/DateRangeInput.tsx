import { useState } from 'react';

import isUndefined from 'lodash/isUndefined';
import styled from 'styled-components/macro';

import { useTranslation } from '../../../../../hooks/useTranslation';
import { BaseFilterInput } from '../../../components';
import { DateRange } from '../../../types';
import { FilterInputProps } from '../FilterInput';

export type DateRangeInputProps = FilterInputProps<DateRange>;

export const DateRangeInput: React.FC<DateRangeInputProps> = ({
  value,
  onChange,
}) => {
  const { t } = useTranslation();

  const [min, setMin] = useState<Date | undefined>(value?.[0]);
  const [max, setMax] = useState<Date | undefined>(value?.[1]);

  return (
    <Container>
      <BaseFilterInput
        type="datetime-local"
        value={min}
        onChange={(newMin) => {
          setMin(newMin);

          if (!isUndefined(newMin) && !isUndefined(max)) {
            onChange([newMin, max]);
          }
        }}
      />

      <Chip>{t('FILTER_AND_OPERATION')}</Chip>

      <BaseFilterInput
        type="datetime-local"
        value={max}
        onChange={(newMax) => {
          setMax(newMax);

          if (!isUndefined(min) && !isUndefined(newMax)) {
            onChange([min, newMax]);
          }
        }}
      />
    </Container>
  );
};

const Container = styled.div`
  display: flex;
  flex-direction: column;
  gap: 8px;
`;

const Chip = styled.div`
  display: flex;
  align-items: center;
  justify-content: center;
  background: var(--cogs-surface--status-undefined--muted--default);
  color: var(--cogs-text-icon--status-undefined);
  border-radius: 6px;
  padding: 6px 12px;
  height: 36px;
  font-weight: 500;
  font-size: 14px;
  line-height: 20px;
`;
