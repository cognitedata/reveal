/* eslint-disable array-callback-return */
import React, { useState } from 'react';
import { Select, Button } from '@cognite/cogs.js';
import { Props as SelectProps } from 'react-select';
import { VisionAPIType } from 'src/api/vision/detectionModels/types';

import * as tagDetectionModelDetails from 'src/modules/Process/Containers/ModelDetails/TagDetectionModelDetails';
import * as objectDetectionModelDetails from 'src/modules/Process/Containers/ModelDetails/ObjectDetectionModelDetails';
import * as ocrModelDetails from 'src/modules/Process/Containers/ModelDetails/OcrModelDetails';
import * as customModelDetails from 'src/modules/Process/Containers/ModelDetails/customModelDetails';

import {
  ColorsOCR,
  ColorsObjectDetection,
  ColorsTagDetection,
} from 'src/constants/Colors';
import styled from 'styled-components';
import { useSelector } from 'react-redux';
import { RootState } from 'src/store/rootReducer';

type SelectOption = {
  label: any;
  value: VisionAPIType;
  backgroundColor: string;
};

// fixme cogs select must accept OptionType generic
type Props = Omit<
  SelectProps<{ label: string; value: VisionAPIType }>,
  'theme'
> & {
  onChange: (value: Array<SelectOption['value']>) => unknown;
  value: Array<SelectOption['value']>;
};

export function DetectionModelSelect({
  value,
  onChange,
  handleCustomModelCreate,
  disabledModelTypes,
  ...props
}: Props) {
  // Remove the selected model(s) that are disabled.
  // For example; it could be that a custom model is selected but after page
  // refresh, custom models are disabled. This filter will make sure that the
  // disabled model type is unselected.
  const enabledSelectedModels = value.filter(
    (modelType) => !disabledModelTypes.includes(modelType)
  );
  const [selectedOptionsCount, setSelectedOptionsCount] = useState<number>(
    enabledSelectedModels.length
  );
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

  const availableDetectionModels = useSelector(
    (state: RootState) => state.processSlice.availableDetectionModels
  );
  // Same as before, but here we make sure that the disabled model type(s) are
  // not shown as option(s) to the user.
  const enabledDetectionModels = availableDetectionModels.filter(
    (item) => !disabledModelTypes.includes(item.type)
  );
  const detectionModelOptions: SelectOption[] = enabledDetectionModels.map(
    // eslint-disable-next-line consistent-return
    (item) => {
      switch (item.type) {
        case VisionAPIType.OCR:
          return {
            label: ocrModelDetails.badge(item.modelName),
            value: VisionAPIType.OCR,
            backgroundColor: ColorsOCR.backgroundColor,
          };

        case VisionAPIType.TagDetection:
          return {
            label: tagDetectionModelDetails.badge(item.modelName),
            value: VisionAPIType.TagDetection,
            backgroundColor: ColorsTagDetection.backgroundColor,
          };

        case VisionAPIType.ObjectDetection:
          return {
            label: objectDetectionModelDetails.badge(item.modelName),
            value: VisionAPIType.ObjectDetection,
            backgroundColor: ColorsObjectDetection.backgroundColor,
          };
        case VisionAPIType.CustomModel:
          return {
            label: customModelDetails.badge(item.modelName),
            value: VisionAPIType.CustomModel,
            backgroundColor: ColorsObjectDetection.backgroundColor,
          };
      }
    }
  );

  const addCustomModelOption = {
    label: (
      <StyledButton
        icon="PlusLarge"
        onClick={handleCustomModelCreate}
        type="ghost"
      >
        Add custom model
      </StyledButton>
    ),
    value: VisionAPIType.CustomModel,
    backgroundColor: '',
  };

  const options =
    // Show create if custom model not already added and if it is enabled
    detectionModelOptions.length > 3 ||
    disabledModelTypes.includes(VisionAPIType.CustomModel)
      ? detectionModelOptions
      : [...detectionModelOptions, addCustomModelOption];

  const toOption = (modelType: VisionAPIType): SelectOption => {
    const option = detectionModelOptions.find(
      (item) => item.value === modelType
    );
    if (!option) {
      throw new Error(`${modelType} is an unknown ML detection model`);
    }
    return option;
  };

  const fromOption = (item: SelectOption): VisionAPIType => {
    return item.value;
  };

  return (
    <Select
      isMulti
      value={enabledSelectedModels
        .filter(
          (modelType) =>
            !!detectionModelOptions.find((item) => item.value === modelType)
        )
        .map(toOption)}
      onChange={(selectedOptions?: Array<SelectOption>) => {
        setSelectedOptionsCount(selectedOptions?.length || 1);
        onChange(selectedOptions?.map(fromOption) || []);
      }}
      options={options}
      {...props}
      styles={colorStyles}
    />
  );
}

const StyledButton = styled(Button)`
  width: 100%;
  justify-content: start;
  &:hover {
    background: none;
  }
`;
