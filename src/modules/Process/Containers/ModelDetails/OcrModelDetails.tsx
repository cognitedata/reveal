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
import { setParamsOCR } from '../../processSlice';

export const description = () => {
  return <Detail>Looks for strings of text and numbers.</Detail>;
};
export const badge = () => {
  return (
    <Button
      icon="TextScan"
      style={{
        backgroundColor: '#F0FCF8',
        color: '#00665C',
      }}
    >
      Text detection
    </Button>
  );
};

export const content = () => {
  const dispatch = useDispatch();

  const params: ParamsOCR = useSelector(
    ({ processSlice }: RootState) => processSlice.detectionModelParameters.ocr
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
        {/* <Tabs.TabPane key="style" tab="Look and feel">
          View is here
        </Tabs.TabPane> */}
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
