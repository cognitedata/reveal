import React from 'react';
import { Select } from '@cognite/cogs.js';
import { Props as SelectProps } from 'react-select';
import { VisionAPIType } from 'src/api/types';

type SelectOption = {
  label: string;
  value: VisionAPIType;
};

const availableDetectionModels: Array<SelectOption> = [
  {
    label: 'Text detection',
    value: VisionAPIType.OCR,
  },
  {
    label: 'Asset tag detection',
    value: VisionAPIType.TagDetection,
  },
  {
    label: 'Object  & person detection',
    value: VisionAPIType.ObjectDetection,
  },
];

function toOption(modelType: VisionAPIType): SelectOption {
  const option = availableDetectionModels.find(
    ({ value }) => value === modelType
  );
  if (!option) {
    throw new Error(`${modelType} is unknown ML detection model`);
  }
  return option;
}

function fromOption({ value }: SelectOption): VisionAPIType {
  return value;
}

// fixme cogs select must accept OptionType generic
type Props = Omit<
  SelectProps<{ label: string; value: VisionAPIType }>,
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
