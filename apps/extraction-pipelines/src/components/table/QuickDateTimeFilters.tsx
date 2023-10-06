import React, { FunctionComponent, useEffect, useState } from 'react';

import styled from 'styled-components';

import moment from 'moment';

import { Colors, Range } from '@cognite/cogs.js';

import {
  updateDateRangeAction,
  useRunFilterContext,
} from '../../hooks/runs/RunsFilterContext';
import { findSelectedRangeOption } from '../../utils/dateUtils';
import { DivFlex } from '../styled';

export const HOURS_1: Readonly<string> = '1H';
export const HOURS_24: Readonly<string> = '24H';
export const DAYS_7: Readonly<string> = '7D';
export const DAYS_30: Readonly<string> = '30D';

const Wrapper = styled(DivFlex)`
  background-color: ${Colors['decorative--grayscale--white']};
  border-radius: 4px;
  border: 1px solid ${Colors['decorative--grayscale--500']};
  .visually-hidden {
    clip: rect(0 0 0 0);
    clip-path: inset(50%);
    height: 1px;
    overflow: hidden;
    position: static;
    white-space: nowrap;
    width: 1px;
  }
  label {
    display: flex;
    padding: 0.4rem 0.9rem;
  }
  input[type='radio']:checked + label {
    background-color: ${Colors['surface--interactive--toggled-default']};
  }
  input[type='radio']:focus + label {
    box-shadow: 0 0 0 4px ${Colors['decorative--blue--400']};
  }
`;

export const quickFilterOptions = (): ReadonlyArray<QuickFilterType> => {
  return [
    {
      label: HOURS_1,
      startDate: moment().subtract(1, 'hour').toDate(),
      endDate: moment().toDate(),
    },
    {
      label: HOURS_24,
      startDate: moment().subtract(24, 'hours').toDate(),
      endDate: moment().toDate(),
    },
    {
      label: DAYS_7,
      startDate: moment().subtract(7, 'days').toDate(),
      endDate: moment().toDate(),
    },
    {
      label: DAYS_30,
      startDate: moment().subtract(30, 'days').toDate(),
      endDate: moment().toDate(),
    },
  ];
};

export interface QuickFilterType extends Range {
  label: string;
}
export const QuickDateTimeFilters: FunctionComponent = () => {
  const {
    state: { dateRange },
    dispatch,
  } = useRunFilterContext();
  const [selected, setSelected] = useState<string | undefined>();
  useEffect(() => {
    setSelected(findSelectedRangeOption(quickFilterOptions(), dateRange));
  }, [dateRange]);

  const handleClick = ({ startDate, endDate, label }: QuickFilterType) => {
    return () => {
      dispatch(updateDateRangeAction({ startDate, endDate }));
      setSelected(label);
    };
  };

  return (
    <Wrapper>
      {quickFilterOptions().map(({ label, startDate, endDate }) => {
        return (
          <React.Fragment key={startDate?.toISOString() ?? label}>
            <input
              type="radio"
              className="visually-hidden"
              name={label}
              id={label}
              onChange={handleClick({ startDate, endDate, label })}
              checked={selected === label}
            />
            <label className="cogs-btn cogs-btn-ghost" htmlFor={label}>
              {label}
            </label>
          </React.Fragment>
        );
      })}
    </Wrapper>
  );
};