import React, {
  Dispatch,
  FunctionComponent,
  PropsWithChildren,
  SetStateAction,
  useState,
} from 'react';
import { Button, Colors, Range } from '@cognite/cogs.js';
import moment from 'moment';
import { DivFlex } from 'styles/flex/StyledFlex';
import styled from 'styled-components';

const HOURS_1: Readonly<string> = '1H';
const HOURS_24: Readonly<string> = '24H';
const DAYS_7: Readonly<string> = '7D';
const DAYS_30: Readonly<string> = '30D';

export const SelectableButton = styled(Button)`
  &.selected {
    background-color: ${Colors['midblue-7'].hex()};
  }
`;

interface QuickDateTimeFiltersProps {
  setDateRange: Dispatch<SetStateAction<Range>>;
}

export interface QuickFilterType extends Range {
  label: string;
}
export const QuickDateTimeFilters: FunctionComponent<QuickDateTimeFiltersProps> = ({
  setDateRange,
}: PropsWithChildren<QuickDateTimeFiltersProps>) => {
  const [selected, setSelected] = useState<string>();
  const quickFilterOptions: ReadonlyArray<QuickFilterType> = [
    {
      label: HOURS_1,
      startDate: moment().subtract(1, 'hour').toDate(),
      endDate: new Date(),
    },
    {
      label: HOURS_24,
      startDate: moment().subtract(24, 'hours').toDate(),
      endDate: new Date(),
    },
    {
      label: DAYS_7,
      startDate: moment().subtract(7, 'days').toDate(),
      endDate: new Date(),
    },
    {
      label: DAYS_30,
      startDate: moment().subtract(30, 'days').toDate(),
      endDate: new Date(),
    },
  ];
  const handleClick = ({ startDate, endDate, label }: QuickFilterType) => {
    return () => {
      setDateRange({ startDate, endDate });
      setSelected(label);
    };
  };

  return (
    <DivFlex>
      {quickFilterOptions.map(({ label, startDate, endDate }) => {
        return (
          <SelectableButton
            key={startDate?.toISOString() ?? label}
            type="ghost"
            className={`${selected === label ? 'selected' : ''}`}
            onClick={handleClick({ startDate, endDate, label })}
          >
            {label}
          </SelectableButton>
        );
      })}
    </DivFlex>
  );
};
