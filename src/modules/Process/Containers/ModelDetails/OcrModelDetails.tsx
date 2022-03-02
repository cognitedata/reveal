import {
  Button,
  Detail,
  Icon,
  PrimaryTooltip,
  Row,
  SegmentedControl,
  Title,
} from '@cognite/cogs.js';
import React from 'react';

import { useDispatch, useSelector } from 'react-redux';
import { ParamsOCR } from 'src/api/vision/detectionModels/types';
import { setUnsavedDetectionModelSettings } from 'src/modules/Process/store/slice';
import { RootState } from 'src/store/rootReducer';
import { ColorsOCR } from 'src/constants/Colors';
import OcrIllustration from 'src/assets/visualDescriptions/OcrIllustration.svg';
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

export const badge = (modelName: string, hideText: boolean = false) => {
  return (
    <Button
      icon="TextScan"
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

export const content = (modelIndex: number) => {
  const dispatch = useDispatch();

  const modelName = useSelector(
    ({ processSlice }: RootState) =>
      processSlice.availableDetectionModels[modelIndex].modelName
  );

  const params: ParamsOCR = useSelector(
    ({ processSlice }: RootState) =>
      processSlice.availableDetectionModels[modelIndex]
        .unsavedSettings as ParamsOCR
  );

  const onUseCacheChange = (key: string) => {
    const newParams = {
      modelIndex,
      params: {
        useCache: key === 'true',
      },
    };
    dispatch(setUnsavedDetectionModelSettings(newParams));
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
                    <Detail>Use cached results</Detail>
                    <PrimaryTooltip
                      tooltipTitle=""
                      tooltipText="If True, uses cached result if the file has previously been analyzed."
                    >
                      <Icon type="HelpFilled" style={{ marginLeft: '11px' }} />
                    </PrimaryTooltip>
                  </td>
                  <th>
                    <SegmentedControl
                      style={{ marginRight: 24 }}
                      currentKey={params.useCache ? 'true' : 'false'}
                      onButtonClicked={onUseCacheChange}
                    >
                      <SegmentedControl.Button key="true">
                        True
                      </SegmentedControl.Button>
                      <SegmentedControl.Button key="false">
                        False
                      </SegmentedControl.Button>
                    </SegmentedControl>
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
            <img src={OcrIllustration} alt="OcrIllustration" />
          </div>
        </StyledCol>
      </Row>
    </ModelDetailSettingContainer>
  );
};
