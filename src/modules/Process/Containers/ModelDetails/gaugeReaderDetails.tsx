import React from 'react';
import {
  Button,
  Detail,
  Icon,
  PrimaryTooltip,
  Row,
  Select,
  Title,
} from '@cognite/cogs.js';
import { useDispatch, useSelector } from 'react-redux';
import { ParamsGaugeReader } from 'src/api/vision/detectionModels/types';
import { setUnsavedDetectionModelSettings } from 'src/modules/Process/store/slice';
import { RootState } from 'src/store/rootReducer';
import { ColorsObjectDetection } from 'src/constants/Colors';
import GaugeReaderIllustration from 'src/assets/visualDescriptions/GaugeReaderIllustration.svg';
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
export const badge = (modelName: string, hideText: boolean = false) => {
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

export const content = (modelIndex: number) => {
  const dispatch = useDispatch();
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
                    <PrimaryTooltip
                      tooltipTitle=""
                      tooltipText="The gauge type to detect"
                    >
                      <Icon type="HelpFilled" style={{ marginLeft: '11px' }} />
                    </PrimaryTooltip>
                  </td>
                  <th>
                    <Select
                      value={getOption(params.gaugeType)}
                      onChange={onGaugeTypeChange}
                      options={selectOptions}
                      closeMenuOnSelect
                      isMulti={false}
                    />
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
            <img src={GaugeReaderIllustration} alt="illustration" />
          </div>
        </StyledCol>
      </Row>
    </ModelDetailSettingContainer>
  );
};
