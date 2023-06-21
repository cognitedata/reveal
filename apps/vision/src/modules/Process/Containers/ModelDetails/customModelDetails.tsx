import React, { useState } from 'react';
import { useDispatch, useSelector } from 'react-redux';

import styled from 'styled-components';

import { AutoMLAPI } from '@vision/api/vision/autoML/AutoMLAPI';
import { AutoMLModelCore } from '@vision/api/vision/autoML/types';
import {
  DetectionModelParams,
  ParamsCustomModel,
} from '@vision/api/vision/detectionModels/types';
import CustomModelIllustration from '@vision/assets/visualDescriptions/CustomModelIllustration';
import { ColorsObjectDetection } from '@vision/constants/Colors';
import { AutoMLModelSelectFilter } from '@vision/modules/Process/Components/AutoMLModelSelectFilter';
import { setUnsavedDetectionModelSettings } from '@vision/modules/Process/store/slice';
import { AppDispatch } from '@vision/store';
import { RootState } from '@vision/store/rootReducer';
import { getLink, workflowRoutes } from '@vision/utils/workflowRoutes';
import { InputNumber } from 'antd';

import { Button, Detail, Icon, Tooltip, Row, Title } from '@cognite/cogs.js';

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
      CDF. Explore available models{' '}
      <a href={getLink(workflowRoutes.models)} target="_blank" rel="noreferrer">
        here.
      </a>
    </Detail>
  );
};
export const badge = ({
  modelName,
  hideText = false,
  disabled = false,
}: {
  modelName: string;
  hideText?: boolean;
  disabled?: boolean;
}) => {
  return !disabled ? (
    <>
      <Tooltip placement="bottom" content="Model is not configured correctly">
        <Button icon="Scan" size="small" aria-label="ScanIconDisabled" disabled>
          {!hideText && modelName}
        </Button>
      </Tooltip>
    </>
  ) : (
    <Button
      icon="Scan"
      size="small"
      aria-label="ScanIcon"
      style={{
        backgroundColor: ColorsObjectDetection.backgroundColor, // custom model has same style as object detection
        color: ColorsObjectDetection.color,
      }}
    >
      {!hideText && modelName}
    </Button>
  );
};

const Content = (modelIndex: number, customModels?: AutoMLModelCore[]) => {
  const [verifyingModel, setVerifyingModel] = useState<boolean>();
  const dispatch = useDispatch<AppDispatch>();
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
  const isValidCustomModel = params.isValid;
  const isValidThreshold = !!(
    params.threshold >= 0.4 && params.threshold <= 1.0
  );

  const onModelJobChange = async (jobId?: number, name?: string) => {
    if (jobId) {
      setVerifyingModel(true);
      await AutoMLAPI.getAutoMLModel(jobId).then((job) => {
        const newParams = {
          modelIndex,
          params: {
            modelJobId: jobId,
            threshold: params.threshold,
            isValid: job.status === 'Completed',
            modelName: name,
          },
        };
        setVerifyingModel(false);
        dispatch(setUnsavedDetectionModelSettings(newParams));
      });
    }
  };

  const onThresholdChange = (value: number | null) => {
    if (isValidThreshold) {
      const newParams = {
        modelIndex,
        params: {
          ...params,
          modelJobId: params.modelJobId,
          threshold: value,
        } as DetectionModelParams,
      };
      dispatch(setUnsavedDetectionModelSettings(newParams));
    }
  };

  const showLoadingMessage =
    verifyingModel || customModels === undefined || !isValidCustomModel;

  // eslint-disable-next-line no-nested-ternary
  const loadingMessage = verifyingModel
    ? 'Verifying model...'
    : !isValidCustomModel
    ? 'Invalid model'
    : 'Loading models';

  const iconType =
    !isValidCustomModel && !verifyingModel ? 'WarningTriangle' : 'Loader';

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
                    <Tooltip
                      wrapped
                      content="Select which model to perform prediction with"
                    >
                      <div style={{ marginLeft: '11px' }}>
                        <Icon type="HelpFilled" aria-label="HelperIcon" />
                      </div>
                    </Tooltip>
                  </td>
                  <th>
                    <>
                      <SelectContainer>
                        <>
                          <AutoMLModelSelectFilter
                            closeMenuOnSelect
                            isMulti={false}
                            placeholder="Search model job"
                            onJobSelected={onModelJobChange}
                            models={customModels}
                            selectedModelId={params.modelJobId}
                          />
                        </>
                      </SelectContainer>
                      {showLoadingMessage && (
                        <ModelSelectContainer>
                          <div style={{ marginRight: '5px' }}>
                            <Icon
                              type={iconType}
                              aria-label="modelVerificationIcon"
                            />
                          </div>
                          {loadingMessage}
                        </ModelSelectContainer>
                      )}
                    </>
                  </th>
                </tr>
                <tr>
                  <td>
                    <Detail>Confidence threshold</Detail>
                    <Tooltip
                      wrapped
                      content="Threshold for minimum confidence the model has on a detected object"
                    >
                      <div style={{ marginLeft: '11px' }}>
                        <Icon type="HelpFilled" />
                      </div>
                    </Tooltip>
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
                      <InputNumber
                        type="number"
                        min={0.4}
                        max={1}
                        step={0.05}
                        value={params.threshold}
                        onChange={onThresholdChange}
                        // TODO: switch back to the Input component in cogs.js once the issue in
                        // https://cognitedata.slack.com/archives/C011E10CW2F/p1655890641506019?thread_ts=1655888255.471469&cid=C011E10CW2F
                        // is resolved
                        // width={80}
                        // size="large"
                        // style={{ height: '40px', MozAppearance: 'textfield' }}
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
              {badge({ modelName: 'Custom model' })}
              {description()}
            </NameContainer>
            <CustomModelIllustration />
          </div>
        </StyledCol>
      </Row>
    </ModelDetailSettingContainer>
  );
};

export const content = Content;

const ModelSelectContainer = styled.div`
  display: flex;
  flex-direction: row;
  align-items: center;
`;

const SelectContainer = styled.div`
  width: 200px;
  height: 62px;
`;
