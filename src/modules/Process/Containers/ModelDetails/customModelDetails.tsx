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
import { ParamsCustomModel } from 'src/api/vision/detectionModels/types';
import {
  setCustomModelName,
  setUnsavedDetectionModelSettings,
} from 'src/modules/Process/store/slice';
import { RootState } from 'src/store/rootReducer';
import { ColorsObjectDetection } from 'src/constants/Colors';
import CustomModelIllustration from 'src/assets/visualDescriptions/CustomModelIllustration.svg';

import { AutoMLModelSelectFilter } from 'src/modules/Process/Components/AutoMLModelSelectFilter';
import { AutoMLModel } from 'src/api/vision/autoML/types';
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
      Use the generated computer vision models to run predictions on images in
      CDF.
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

export const content = (modelIndex: number, customModels?: AutoMLModel[]) => {
  const dispatch = useDispatch();
  const params: ParamsCustomModel = useSelector(
    ({ processSlice }: RootState) => {
      if (modelIndex < processSlice.availableDetectionModels.length) {
        return processSlice.availableDetectionModels[modelIndex]
          .unsavedSettings as ParamsCustomModel;
      }
      console.warn(
        `Attempted to get custom model contents for index ${modelIndex} while the current number of available models is ${processSlice.availableDetectionModels.length}.`
      );
      return {} as ParamsCustomModel;
    }
  );

  // Model configuration validators
  const isValidThreshold = !!(
    params.threshold >= 0.4 && params.threshold <= 1.0
  );

  const onModelJobChange = async (jobId?: number, name?: string) => {
    if (jobId) {
      const newParams = {
        modelIndex,
        params: {
          modelJobId: jobId,
          threshold: params.threshold,
        },
      };
      dispatch(setUnsavedDetectionModelSettings(newParams));
    }
    if (name) {
      dispatch(setCustomModelName({ modelIndex, modelName: name }));
    }
  };

  const onThresholdChange = (value: number) => {
    if (isValidThreshold) {
      const newParams = {
        modelIndex,
        params: {
          modelJobId: params.modelJobId,
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
                    <Detail>Model</Detail>
                    <PrimaryTooltip
                      tooltipTitle=""
                      tooltipText="Select which model to perform prediction with"
                    >
                      <Icon type="HelpFilled" style={{ marginLeft: '11px' }} />
                    </PrimaryTooltip>
                  </td>
                  <th>
                    <AutoMLModelSelectFilter
                      closeMenuOnSelect
                      isMulti={false}
                      placeholder="Search model job"
                      onJobSelected={onModelJobChange}
                      models={customModels}
                      selectedModelId={params.modelJobId}
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
