import { useState } from 'react';

import { useTranslation } from '@fdx/shared/hooks/useTranslation';
import { DateRange } from '@fdx/shared/types/filters';
import isUndefined from 'lodash/isUndefined';
import styled from 'styled-components/macro';

import { BaseFilterInput, TextChip } from '../../../components';
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
      <BaseFilterInput.Single
        data-testid="date-input-min"
        type="date"
        value={min}
        onChange={(newMin) => {
          setMin(newMin);

          if (!isUndefined(newMin) && !isUndefined(max)) {
            onChange([newMin, max]);
          }
        }}
      />

      <TextChip>{t('FILTER_AND_OPERATION')}</TextChip>

      <BaseFilterInput.Single
        data-testid="date-input-max"
        type="date"
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
