import React, { useState } from 'react';
import { Select } from '@cognite/cogs.js';
import { Props as SelectProps } from 'react-select';
import { VisionAPIType } from 'src/api/types';

import * as tagDetectionModelDetails from 'src/modules/Process/Containers/ModelDetails/TagDetectionModelDetails';
import * as objectDetectionModelDetails from 'src/modules/Process/Containers/ModelDetails/ObjectDetectionModelDetails';
import * as ocrModelDetails from 'src/modules/Process/Containers/ModelDetails/OcrModelDetails';
import {
  ColorsOCR,
  ColorsObjectDetection,
  ColorsTagDetection,
} from 'src/constants/Colors';

type SelectOption = {
  label: any;
  value: VisionAPIType;
  backgroundColor: string;
};

const availableDetectionModels: Array<SelectOption> = [
  {
    label: ocrModelDetails.badge(),
    value: VisionAPIType.OCR,
    backgroundColor: ColorsOCR.backgroundColor,
  },
  {
    label: tagDetectionModelDetails.badge(),
    value: VisionAPIType.TagDetection,
    backgroundColor: ColorsTagDetection.backgroundColor,
  },
  {
    label: objectDetectionModelDetails.badge(),
    value: VisionAPIType.ObjectDetection,
    backgroundColor: ColorsObjectDetection.backgroundColor,
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
  const [selectedOptionsCount, setSelectedOptionsCount] = useState<number>(1);
  const maxFill = 90;
  const colorStyles = {
    base: (styles: any) => ({ ...styles }),
    control: (styles: any) => ({ ...styles, backgroundColor: 'white' }),
    multiValue: (styles: any, { data }: any) => {
      return {
        ...styles,
        backgroundColor: data.backgroundColor,
        maxWidth: `${(maxFill / selectedOptionsCount).toFixed(2)}%`,
        textOverflow: 'ellipsis',
        whiteSpace: 'nowrap',
        overflow: 'hidden',
      };
    },
  };
  return (
    <Select
      isMulti
      value={value.map(toOption)}
      onChange={(selectedOptions?: Array<SelectOption>) => {
        setSelectedOptionsCount(selectedOptions?.length || 1);
        onChange(selectedOptions?.map(fromOption) || []);
      }}
      options={availableDetectionModels}
      {...props}
      styles={colorStyles}
    />
  );
}
