import React from 'react';
import { Select } from '@cognite/cogs.js';
import { Props as SelectProps } from 'react-select';
import { DetectionModelType } from 'src/api/types';

type SelectOption = {
  label: string;
  value: DetectionModelType;
};

const availableDetectionModels: Array<SelectOption> = [
  {
    label: 'Text detection',
    value: DetectionModelType.Text,
  },
  {
    label: 'Tag detection',
    value: DetectionModelType.Tag,
  },
  {
    label: 'GDPR violations detection',
    value: DetectionModelType.GDPR,
  },
];

function toOption(modelType: DetectionModelType): SelectOption {
  const option = availableDetectionModels.find(
    ({ value }) => value === modelType
  );
  if (!option) {
    throw new Error(`${modelType} is unknown ML detection model`);
  }
  return option;
}

function fromOption({ value }: SelectOption): DetectionModelType {
  return value;
}

// fixme cogs select must accept OptionType generic
type Props = Omit<
  SelectProps<{ label: string; value: DetectionModelType }>,
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
