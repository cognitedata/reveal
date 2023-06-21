import React from 'react';
import { useDispatch, useSelector } from 'react-redux';

import {
  DetectionModelParams,
  ParamsOCR,
} from '@vision/api/vision/detectionModels/types';
import OcrIllustration from '@vision/assets/visualDescriptions/OcrIllustration';
import { ColorsOCR } from '@vision/constants/Colors';
import { setUnsavedDetectionModelSettings } from '@vision/modules/Process/store/slice';
import { AppDispatch } from '@vision/store';
import { RootState } from '@vision/store/rootReducer';
import { InputNumber } from 'antd';

import { Title, Button, Icon, Detail, Row, Tooltip } from '@cognite/cogs.js';

import {
  ColorBox,
  NameContainer,
  ModelDetailSettingContainer,
  StyledCol,
  TableContainer,
} from './modelDetailsStyles';

export const description = () => {
  return <Detail>Looks for strings of text and numbers.</Detail>;
};

export const badge = (modelName: string, hideText = false) => {
  return (
    <Button
      icon="String"
      size="small"
      style={{
        backgroundColor: ColorsOCR.backgroundColor,
        color: ColorsOCR.color,
      }}
    >
      {!hideText && modelName}
    </Button>
  );
};

const Content = (modelIndex: number) => {
  const dispatch = useDispatch<AppDispatch>();

  const modelName = useSelector(
    ({ processSlice }: RootState) =>
      processSlice.availableDetectionModels[modelIndex].modelName
  );

  const params: ParamsOCR = useSelector(
    ({ processSlice }: RootState) =>
      processSlice.availableDetectionModels[modelIndex]
        .unsavedSettings as ParamsOCR
  );

  const isValidThreshold = params.threshold >= 0.4 && params.threshold <= 1.0;

  const onThresholdChange = (value: number | null) => {
    if (isValidThreshold) {
      const newParams = {
        modelIndex,
        params: {
          threshold: value,
        } as DetectionModelParams,
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
                      <ColorBox color={ColorsOCR.color} />
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
            <OcrIllustration />
          </div>
        </StyledCol>
      </Row>
    </ModelDetailSettingContainer>
  );
};
export const content = Content;
