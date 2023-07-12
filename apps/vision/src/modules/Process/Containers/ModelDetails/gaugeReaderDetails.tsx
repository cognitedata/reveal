import React from 'react';
import { useDispatch, useSelector } from 'react-redux';

import styled from 'styled-components';

import { ParamsGaugeReader } from '@vision/api/vision/detectionModels/types';
import GaugeReaderIllustration from '@vision/assets/visualDescriptions/GaugeReaderIllustration';
import { ColorsObjectDetection } from '@vision/constants/Colors';
import { setUnsavedDetectionModelSettings } from '@vision/modules/Process/store/slice';
import { useThunkDispatch } from '@vision/store';
import { RootState } from '@vision/store/rootReducer';

import {
  Button,
  Detail,
  Icon,
  Tooltip,
  Row,
  Select,
  Title,
} from '@cognite/cogs.js';

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
      Read value of an analog, level or digital gauge from an image
    </Detail>
  );
};
export const badge = (modelName: string, hideText = false) => {
  return (
    <Button
      icon="Scan"
      size="small"
      style={{
        backgroundColor: ColorsObjectDetection.backgroundColor, // gauge reader has same style as object detection
        color: ColorsObjectDetection.color,
      }}
    >
      {!hideText && modelName}
    </Button>
  );
};

export const Content = (modelIndex: number) => {
  const dispatch = useThunkDispatch();
  const params: ParamsGaugeReader = useSelector(
    ({ processSlice }: RootState) =>
      processSlice.availableDetectionModels[modelIndex]
        .unsavedSettings as ParamsGaugeReader
  );

  type GaugeSelectType = {
    label: string;
    text: string;
  };

  const onGaugeTypeChange = (value: GaugeSelectType) => {
    const newParams = {
      modelIndex,
      params: {
        gaugeType: value.label,
      },
    };
    dispatch(setUnsavedDetectionModelSettings(newParams));
  };

  const selectOptions = ['analog', 'level', 'digital'].map((item) => {
    return { label: item, value: item };
  });

  const getOption = (value: string) => {
    return { label: value, value };
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
                    <Detail>Gauge type</Detail>
                    <Tooltip wrapped content="The gauge type to detect">
                      <div style={{ marginLeft: '11px' }}>
                        <Icon type="HelpFilled" />
                      </div>
                    </Tooltip>
                  </td>
                  <th>
                    <SelectContainer>
                      <>
                        <Select
                          value={getOption(params.gaugeType)}
                          onChange={onGaugeTypeChange}
                          options={selectOptions}
                          closeMenuOnSelect
                          isMulti={false}
                        />
                      </>
                    </SelectContainer>
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
              {badge('Gauge Reader')}
              {description()}
            </NameContainer>
            <GaugeReaderIllustration />
          </div>
        </StyledCol>
      </Row>
    </ModelDetailSettingContainer>
  );
};

export const content = Content;

const SelectContainer = styled.div`
  width: 200px;
  height: 62px;
`;
