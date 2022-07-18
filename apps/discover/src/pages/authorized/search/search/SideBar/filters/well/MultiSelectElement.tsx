import React from 'react';

import isArray from 'lodash/isArray';

import { MultiSelect } from 'components/Filters';
import {
  WellFilterOption,
  WellFilterOptionValue,
} from 'modules/wellSearch/types';

import { MultiSelectWrapper } from './elements';

export type Props = {
  onValueChange: (filterId: number, value: any) => void;
  groupedOptions?: {
    label: string;
    options: (WellFilterOption | WellFilterOptionValue)[];
  }[];
  options: (WellFilterOption | WellFilterOptionValue)[];
  selectedOptions: string | WellFilterOptionValue[];
  title: string;
  isTextCapitalized?: boolean;
  filterId: number;
  footer?: () => React.ReactElement;
};

export const MultiSelectElement: React.FC<Props> = React.memo(
  ({
    onValueChange,
    groupedOptions,
    options,
    selectedOptions,
    title,
    isTextCapitalized,
    filterId,
    footer,
  }: Props) => {
    return (
      <MultiSelectWrapper>
        <MultiSelect
          options={options}
          groupedOptions={groupedOptions}
          selectedOptions={
            isArray(selectedOptions) ? selectedOptions : [selectedOptions]
          }
          title={title}
          titlePlacement="top"
          onValueChange={(values: string[]) => onValueChange(filterId, values)}
          isTextCapitalized={isTextCapitalized}
          footer={footer}
        />
      </MultiSelectWrapper>
    );
  }
);
