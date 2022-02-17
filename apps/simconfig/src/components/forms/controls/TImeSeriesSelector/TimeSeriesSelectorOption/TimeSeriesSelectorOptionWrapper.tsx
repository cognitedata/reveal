import React from 'react';
import type { GroupTypeBase, OptionProps, Props } from 'react-select';

import styled from 'styled-components/macro';

import type { OptionType } from '@cognite/cogs.js';
import { Title } from '@cognite/cogs.js';

import type { Option } from '../TimeSeriesSelector';

type DropdownProps = OptionProps<OptionType<Option>, false> & {
  data: Option;
};

type SelectProps = Props<
  OptionType<Option>,
  false,
  GroupTypeBase<OptionType<Option>>
> & {
  renderOption?: (option: Option) => JSX.Element;
};

function TimeSeriesSelectorOptionWrapper({
  innerRef,
  innerProps,
  children,
  cx,
  isDisabled,
  isFocused,
  isSelected,
  className,
  data,
  selectProps,
}: DropdownProps) {
  const { renderOption }: SelectProps = selectProps;

  const content = renderOption ? (
    renderOption(data as Option)
  ) : (
    <Title level={6}>{children}</Title>
  );

  return (
    <OptionWrapper
      isSelected={isSelected}
      {...innerProps}
      className={cx(
        {
          'option': true,
          'option--is-disabled': isDisabled,
          'option--is-focused': isFocused,
          'option--is-selected': isSelected,
        },
        className
      )}
      ref={innerRef}
    >
      {content}
    </OptionWrapper>
  );
}

export const OptionWrapper = styled.div<{ isSelected: boolean }>`
  display: flex;
  text-align: left !important;
  align-content: start;
  flex-direction: row;
  cursor: pointer !important;
  white-space: break-spaces;
  border: ${(props) =>
    props.isSelected ? '1px solid var(--cogs-text-accent)' : 'white'};
`;

export default TimeSeriesSelectorOptionWrapper;
