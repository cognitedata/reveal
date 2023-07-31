import * as React from 'react';

import isArray from 'lodash/isArray';
import sortBy from 'lodash/sortBy';

import { WellFilterOptionValue } from 'modules/wellSearch/types';

import { Checkboxes } from '../../components/Checkboxes';

export type Props = {
  onValueChange: (filterId: number, value: any) => void;
  options: any[];
  selectedOptions: string | WellFilterOptionValue[];
  title: string;
  filterId: number;
};

export const CheckboxElement: React.FC<Props> = React.memo(
  ({ onValueChange, options, selectedOptions, title, filterId }: Props) => {
    const data = sortBy(options, 'value').map((option) => ({
      name: option.value,
      count: option.count,
      selected:
        isArray(selectedOptions) && selectedOptions.includes(option.value),
    }));
    return (
      <Checkboxes
        data={data}
        title={title}
        onValueChange={(values: string[]) => onValueChange(filterId, values)}
      />
    );
  }
);
