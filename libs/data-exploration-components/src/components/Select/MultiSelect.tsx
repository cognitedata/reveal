import React from 'react';

import { ActionMeta } from 'react-select';

import { OptionType } from '@cognite/cogs.js';

import { BaseSelect, BaseSelectProps } from './BaseSelect';

export interface MultiSelectProps<ValueType>
  extends Exclude<BaseSelectProps<ValueType>, 'isMulti'> {
  value?: OptionType<ValueType>[];
  onChange?: (
    value: OptionType<ValueType>[],
    action: ActionMeta<OptionType<ValueType>>
  ) => void;
}

export const MultiSelect = <ValueType,>(props: MultiSelectProps<ValueType>) => {
  return <BaseSelect {...props} isMulti />;
};
