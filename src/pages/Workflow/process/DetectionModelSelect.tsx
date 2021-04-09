import React from 'react';
import { Select } from '@cognite/cogs.js';
import { Props as SelectProps } from 'react-select';
import { DetectionModelCategory } from 'src/api/types';

type SelectOption = {
  label: string;
  value: DetectionModelCategory;
};

const availableDetectionModels: Array<SelectOption> = [
  {
    label: 'Text & object detection',
    value: DetectionModelCategory.TextAndObjects,
  },
  {
    label: 'Asset tag detection',
    value: DetectionModelCategory.AssetTag,
  },
  {
    label: 'GDPR violations detection',
    value: DetectionModelCategory.GDPR,
  },
];

function toOption(modelType: DetectionModelCategory): SelectOption {
  const option = availableDetectionModels.find(
    ({ value }) => value === modelType
  );
  if (!option) {
    throw new Error(`${modelType} is unknown ML detection model`);
  }
  return option;
}

function fromOption({ value }: SelectOption): DetectionModelCategory {
  return value;
}

// fixme cogs select must accept OptionType generic
type Props = Omit<
  SelectProps<{ label: string; value: DetectionModelCategory }>,
  'theme'
> & {
  onChange: (value: Array<SelectOption['value']>) => unknown;
  value: Array<SelectOption['value']>;
};

export function DetectionModelSelect({ value, onChange, ...props }: Props) {
  return (
    <Select
      isMulti
      value={value.map(toOption)}
      onChange={(selectedOptions?: Array<SelectOption>) => {
        onChange(selectedOptions?.map(fromOption) || []);
      }}
      options={availableDetectionModels}
      {...props}
    />
  );
}
