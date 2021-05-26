import {
  Button,
  Detail,
  Icon,
  Input,
  PrimaryTooltip,
  Row,
  Tabs,
} from '@cognite/cogs.js';
import React from 'react';
import styled from 'styled-components';
import { useDispatch, useSelector } from 'react-redux';
import { ParamsObjectDetection } from 'src/api/types';
import { RootState } from 'src/store/rootReducer';
import { setParamsObjectDetection } from '../../processSlice';

export const description = () => {
  return (
    <Detail>Detects people, recognizable shapes and labels accordingly.</Detail>
  );
};
export const badge = () => {
  return (
    <Button
      icon="Scan"
      style={{
        backgroundColor: '#FFE1D1',
        color: '#FF8746',
      }}
    >
      Object & person detection
    </Button>
  );
};

export const content = () => {
  const dispatch = useDispatch();

  const params: ParamsObjectDetection = useSelector(
    ({ processSlice }: RootState) =>
      processSlice.detectionModelParameters.objectDetection
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
    <Container>
      <Tabs defaultActiveKey="config">
        <Tabs.TabPane key="config" tab="Model configuration">
          <table>
            <tbody>
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
      padding: 12px;
    }
  }
`;
