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
import { ParamsObjectDetection } from 'src/api/types';
import { RootState } from 'src/store/rootReducer';
import { ColorsObjectDetection } from 'src/constants/Colors';
import ObjectDetectionIllustration from 'src/assets/visualDescriptions/ObjectDetectionIllustration.svg';
import { setParamsObjectDetection } from '../../processSlice';
import {
  ColorBox,
  NameContainer,
  ModelDetailSettingContainer,
  StyledCol,
  TableContainer,
} from './modelDetailsStyles';

const modelName = 'Object detection';

export const description = () => {
  return (
    <Detail>Detects people, recognizable shapes and labels accordingly.</Detail>
  );
};
export const badge = (hideText: boolean = false) => {
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

export const content = () => {
  const dispatch = useDispatch();

  const params: ParamsObjectDetection = useSelector(
    ({ processSlice }: RootState) =>
      processSlice.temporaryDetectionModelParameters.objectDetection
  );

  const isValidThreshold = !!(
    params.threshold >= 0.4 && params.threshold <= 1.0
  );

  const onThresholdChange = (value: number) => {
    if (isValidThreshold) {
      const newParams: ParamsObjectDetection = {
        threshold: value,
      };
      dispatch(setParamsObjectDetection(newParams));
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
                    <PrimaryTooltip
                      tooltipTitle=""
                      tooltipText="Threshold for minimum confidence the model has on a detected object"
                    >
                      <Icon type="HelpFilled" style={{ marginLeft: '11px' }} />
                    </PrimaryTooltip>
                  </td>
                  <th>
                    <Row>
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
              {badge()}
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
