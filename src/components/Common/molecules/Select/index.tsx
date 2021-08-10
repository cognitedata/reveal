import React from 'react';
import { Select as CogsSelect } from '@cognite/cogs.js';
import { FilterWrapper } from 'components/Filters';
import { CustomSelectProps } from './types';
import { selectStyles } from './styles';

export const Select = (props: CustomSelectProps) => {
  const { selectProps, tooltipProps = {} } = props;

  const getContainer = () => {
    const els = document.getElementsByClassName('context-ui-pnid-style-scope');
    const el = els.item(0)! as HTMLElement;
    return el;
  };

  const defaultSelectProps = {
    maxHeight: 80,
    // showSelectedItemCount: true,
    placeholder: 'All',
    // placeholderSelectText: 'selected',
    styles: selectStyles,
    menuPortalTarget: getContainer(),
  };

  return (
    <FilterWrapper {...tooltipProps}>
      <CogsSelect {...defaultSelectProps} {...selectProps} />
    </FilterWrapper>
  );
};
