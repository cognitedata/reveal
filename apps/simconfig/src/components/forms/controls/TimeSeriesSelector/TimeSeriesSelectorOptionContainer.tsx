import type { GroupTypeBase, Props } from 'react-select';

import styled from 'styled-components/macro';

import type { OptionProps, OptionType } from '@cognite/cogs.js';
import { Title } from '@cognite/cogs.js';

import type { TimeseriesOption } from './types';

interface TimeseriesSelectorOptionContainerProps
  extends Omit<
    OptionProps<OptionType<TimeseriesOption>, false>,
    'data' | 'selectProps'
  > {
  data: TimeseriesOption;
  selectProps: Props<
    OptionType<TimeseriesOption>,
    false,
    GroupTypeBase<OptionType<TimeseriesOption>>
  > & {
    renderOption?: (option: TimeseriesOption) => JSX.Element;
  };
}

function TimeseriesSelectorOptionContainer({
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
}: TimeseriesSelectorOptionContainerProps) {
  const { renderOption } = selectProps;

  const content = renderOption ? (
    renderOption(data)
  ) : (
    <Title level={6}>{children}</Title>
  );

  return (
    <OptionContainer
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
    </OptionContainer>
  );
}

export const OptionContainer = styled.div<{ isSelected: boolean }>`
  cursor: pointer !important;
  box-shadow: ${(props) =>
    props.isSelected ? 'inset 0 0 0 2.5px var(--cogs-primary)' : 'none'};
`;

export default TimeseriesSelectorOptionContainer;
