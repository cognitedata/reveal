import {
  Button,
  Detail,
  Icon,
  Input,
  PrimaryTooltip,
  Row,
  Title,
} from '@cognite/cogs.js';
import React from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { ParamsCustomModel } from 'src/api/types';
import {
  setCustomModelName,
  setUnsavedDetectionModelSettings,
} from 'src/modules/Process/processSlice';
import { RootState } from 'src/store/rootReducer';
import { ColorsObjectDetection } from 'src/constants/Colors';
import CustomModelIllustration from 'src/assets/visualDescriptions/CustomModelIllustration.svg';

import { FileSelectFilter } from 'src/modules/Common/Components/FileSelectFilter/FileSelectFilter';
import {
  ColorBox,
  NameContainer,
  ModelDetailSettingContainer,
  StyledCol,
  TableContainer,
} from './modelDetailsStyles';

export const description = () => {
  return (
    <Detail>
      Upload pre-trained model file to CDF and use this model to run predictions
      on images in CDF.
    </Detail>
  );
};
export const badge = (modelName: string, hideText: boolean = false) => {
  return (
    <Button
      icon="Scan"
      size="small"
      style={{
        backgroundColor: ColorsObjectDetection.backgroundColor, // custom model has same style as object detection
        color: ColorsObjectDetection.color,
      }}
    >
      {!hideText && modelName}
    </Button>
  );
};

export const content = (modelIndex: number) => {
  const dispatch = useDispatch();
  const modelName = useSelector(
    ({ processSlice }: RootState) =>
      processSlice.availableDetectionModels[modelIndex].modelName
  );
  const params: ParamsCustomModel = useSelector(
    ({ processSlice }: RootState) =>
      processSlice.availableDetectionModels[modelIndex]
        .unsavedSettings as ParamsCustomModel
  );

  // Model configuration validators
  const isValidThreshold = !!(
    params.threshold >= 0.4 && params.threshold <= 1.0
  );

  // Model configuration handlers
  const onModelNameChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    dispatch(setCustomModelName({ modelIndex, modelName: e.target.value }));
  };

  const onModelFileIdChange = async (fileIds?: number[]) => {
    if (fileIds) {
      const modeFile = { fileId: fileIds[0] }; // isMulti is false, so use first and only element
      const newParams = {
        modelIndex,
        params: {
          modelFile: modeFile,
          threshold: params.threshold,
        },
      };
      dispatch(setUnsavedDetectionModelSettings(newParams));
    }
  };

  const onThresholdChange = (value: number) => {
    if (isValidThreshold) {
      const newParams = {
        modelIndex,
        params: {
          modelFile: params.modelFile,
          threshold: value,
        },
      };
      dispatch(setUnsavedDetectionModelSettings(newParams));
    }
  };

  return (
    <ModelDetailSettingContainer>
      <Row cols={2}>
        <StyledCol span={1}>
          <TableContainer>
            <table>
              <tbody>
                <tr>
                  <td>
                    <Title level={5}> Key</Title>
                  </td>
                  <th>
                    <Title level={5}> Value</Title>
                  </th>
                </tr>
                <tr>
                  <td>
                    <Detail>Model name</Detail>
                    <PrimaryTooltip
                      tooltipTitle=""
                      tooltipText="Custom model name"
                    >
                      <Icon type="HelpFilled" style={{ marginLeft: '11px' }} />
                    </PrimaryTooltip>
                  </td>
                  <th>
                    <Input
                      type="text"
                      placeholder="Enter custom model name"
                      style={{ width: '100%' }}
                      onChange={onModelNameChange}
                      value={modelName}
                    />
                  </th>
                </tr>
                <tr>
                  <td>
                    <Detail>Model file*</Detail>
                    <PrimaryTooltip
                      tooltipTitle=""
                      tooltipText="Model filename (.tflite)"
                    >
                      <Icon type="HelpFilled" style={{ marginLeft: '11px' }} />
                    </PrimaryTooltip>
                  </td>
                  <th>
                    <FileSelectFilter
                      closeMenuOnSelect
                      fileExtension=".tflite"
                      placeholder="Search model file"
                      onFileSelected={onModelFileIdChange}
                      selectedFiles={
                        params.modelFile ? [params.modelFile.fileId] : []
                      }
                    />
                  </th>
                </tr>
                <tr>
                  <td>
                    <Detail>Confidence threshold</Detail>
                    <PrimaryTooltip
                      tooltipTitle=""
                      tooltipText="Threshold for minimum confidence the model has on a detected object"
                    >
                      <Icon type="HelpFilled" style={{ marginLeft: '11px' }} />
                    </PrimaryTooltip>
                  </td>
                  <th>
                    <Row>
                      <input
                        type="range"
                        min={0.4}
                        max={1}
                        value={params.threshold}
                        onChange={(e) =>
                          onThresholdChange(parseFloat(e.target.value))
                        }
                        step={0.05}
                      />
                      <Input
                        type="number"
                        size="large"
                        width={80}
                        min={0.4}
                        max={1}
                        step={0.05}
                        value={params.threshold}
                        setValue={onThresholdChange}
                        style={{ height: '40px', MozAppearance: 'textfield' }}
                      />
                    </Row>
                  </th>
                </tr>
                <tr>
                  <td>
                    <Detail>Color</Detail>
                  </td>
                  <th>
                    <div style={{ display: 'flex' }}>
                      <ColorBox color={ColorsObjectDetection.color} />
                    </div>
                  </th>
                </tr>
              </tbody>
            </table>
          </TableContainer>
        </StyledCol>
        <StyledCol span={1}>
          <div>
            <NameContainer>
              {badge('Custom model')}
              {description()}
            </NameContainer>
            <img
              src={CustomModelIllustration}
              alt="ObjectDetectionIllustration"
            />
          </div>
        </StyledCol>
      </Row>
    </ModelDetailSettingContainer>
  );
};
