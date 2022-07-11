import { Button, Detail, Icon, Tooltip, Row, Title } from '@cognite/cogs.js';
import React from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { ParamsObjectDetection } from 'src/api/vision/detectionModels/types';
import { setUnsavedDetectionModelSettings } from 'src/modules/Process/store/slice';
import { RootState } from 'src/store/rootReducer';
import { ColorsObjectDetection } from 'src/constants/Colors';
import ObjectDetectionIllustration from 'src/assets/visualDescriptions/ObjectDetectionIllustration.svg';
import { InputNumber } from 'antd';
import {
  ColorBox,
  NameContainer,
  ModelDetailSettingContainer,
  StyledCol,
  TableContainer,
} from './modelDetailsStyles';

export const description = () => {
  return (
    <Detail>Detects people, recognizable shapes and labels accordingly.</Detail>
  );
};
export const badge = (modelName: string, hideText: boolean = false) => {
  return (
    <Button
      icon="Scan"
      size="small"
      style={{
        backgroundColor: ColorsObjectDetection.backgroundColor,
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

  const params: ParamsObjectDetection = useSelector(
    ({ processSlice }: RootState) =>
      processSlice.availableDetectionModels[modelIndex]
        .unsavedSettings as ParamsObjectDetection
  );

  const isValidThreshold = !!(
    params.threshold >= 0.4 && params.threshold <= 1.0
  );

  const onThresholdChange = (value: number) => {
    if (isValidThreshold) {
      const newParams = {
        modelIndex,
        params: {
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
                    <Detail>Confidence threshold</Detail>
                    <Tooltip
                      wrapped
                      content="Threshold for minimum confidence the model has on a detected object"
                    >
                      <Icon type="HelpFilled" style={{ marginLeft: '11px' }} />
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
                        // size="large"
                        // width={80}
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
              {badge(modelName)}
              {description()}
            </NameContainer>
            <img
              src={ObjectDetectionIllustration}
              alt="ObjectDetectionIllustration"
            />
          </div>
        </StyledCol>
      </Row>
    </ModelDetailSettingContainer>
  );
};
