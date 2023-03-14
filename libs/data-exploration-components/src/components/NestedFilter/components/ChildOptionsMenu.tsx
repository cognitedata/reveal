import * as React from 'react';

import isEmpty from 'lodash/isEmpty';
import omit from 'lodash/omit';

import { NestedFilterSelection, ChildOptionType } from '../types';
import { getChildOptionsSelection } from '../utils/getChildOptionsSelection';

import { OptionsMenu } from './OptionsMenu';

export interface ChildOptionsMenuProps {
  parentOptionValue: string;
  options?: Array<ChildOptionType>;
  selection: NestedFilterSelection;
  onChange: (selection: NestedFilterSelection) => void;
  enableSorting?: boolean;
}

export const ChildOptionsMenu: React.FC<ChildOptionsMenuProps> = ({
  parentOptionValue,
  options,
  selection,
  onChange,
  enableSorting,
}) => {
  if (!options || isEmpty(options)) {
    return null;
  }

  const handleChildOptionChange = (
    childOptionValues: string[],
    isAllSelected: boolean
  ) => {
    if (isEmpty(childOptionValues)) {
      onChange(omit(selection, parentOptionValue));
      return;
    }

    const newSelection = {
      ...selection,
      [parentOptionValue]: isAllSelected ? [] : childOptionValues,
    };

    onChange(newSelection);
  };

  return (
    <OptionsMenu
      options={options}
      selection={getChildOptionsSelection(
        options,
        selection[parentOptionValue]
      )}
      onChange={(childOptionsSelection) => {
        const selectedOptions = Object.keys(childOptionsSelection);
        handleChildOptionChange(
          selectedOptions,
          selectedOptions.length === options.length
        );
      }}
      enableSorting={enableSorting}
    />
  );
};
