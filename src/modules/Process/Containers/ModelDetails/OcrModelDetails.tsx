import {
  Button,
  Detail,
  Icon,
  PrimaryTooltip,
  SegmentedControl,
  Tabs,
} from '@cognite/cogs.js';
import React from 'react';
import styled from 'styled-components';
import { useDispatch, useSelector } from 'react-redux';
import { ParamsOCR } from 'src/api/types';
import { RootState } from 'src/store/rootReducer';
import { ColorsOCR } from 'src/constants/Colors';
import { setParamsOCR } from '../../processSlice';
import { ModelDescription } from './ModelDescription';

const modelName = 'Text detection';

export const description = () => {
  return <Detail>Looks for strings of text and numbers.</Detail>;
};

export const badge = (hideText: boolean = false) => {
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

export const content = () => {
  const dispatch = useDispatch();

  const params: ParamsOCR = useSelector(
    ({ processSlice }: RootState) =>
      processSlice.temporaryDetectionModelParameters.ocr
  );

  const onUseCacheChange = (key: string) => {
    const newParams: ParamsOCR = {
      useCache: key === 'true',
    };
    dispatch(setParamsOCR(newParams));
  };

  return (
    <Container>
      <Tabs defaultActiveKey="config">
        <Tabs.TabPane key="config" tab="Model configuration">
          <table>
            <tbody>
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
            </tbody>
          </table>
        </Tabs.TabPane>
        <Tabs.TabPane key="description" tab="Description">
          {ModelDescription({
            name: modelName,
            description: description(),
            icon: badge(true),
          })}
        </Tabs.TabPane>
      </Tabs>
    </Container>
  );
};

const Container = styled.div`
  display: inline-table;

  table {
    table-layout: fixed;
    width: 100%;
    overflow: hidden;
    text-overflow: ellipsis;
    white-space: nowrap;
    font-size: smaller;
    margin-top: 12px;

    td {
      padding: 16px;
    }
  }
`;
