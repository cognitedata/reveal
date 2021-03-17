import React, { useState } from 'react';
import {
  Chart,
  ChartWorkflow,
  FunctionCallStatus,
} from 'reducers/charts/types';
import { Dropdown, Icon } from '@cognite/cogs.js';
import FunctionCall from 'components/FunctionCall';
import { updateWorkflow } from 'utils/charts';
import {
  SourceItem,
  SourceSquare,
  SourceMenu,
  SourceName,
  SourceRow,
} from './elements';
import WorkflowMenu from './WorkflowMenu';

const renderStatusIcon = (status?: FunctionCallStatus) => {
  switch (status) {
    case 'Running':
      return <Icon type="Loading" />;
    case 'Completed':
      return <Icon type="Check" />;
    case 'Failed':
    case 'Timeout':
      return <Icon type="Close" />;
    default:
      return null;
  }
};

type Props = {
  chart: Chart;
  workflow: ChartWorkflow;
  setActiveSourceItem: (id?: string) => void;
  isActive?: boolean;
  isWorkspaceMode?: boolean;
  isDataQualityMode?: boolean;
  mutate: (c: Chart) => void;
};
export default function WorkflowRow({
  chart,
  workflow,
  setActiveSourceItem,
  isActive = false,
  isWorkspaceMode = false,
  isDataQualityMode = false,
  mutate,
}: Props) {
  // Increasing this will cause a fresh render where the dropdown is closed
  const [idHack, setIdHack] = useState(0);
  const { id, enabled, color, name, calls } = workflow;
  const call = calls?.sort((c) => c.callDate)[0];

  const update = (wfId: string, diff: Partial<ChartWorkflow>) => {
    mutate(updateWorkflow(chart, wfId, diff));
  };

  return (
    <SourceRow onClick={() => setActiveSourceItem(id)} isActive={isActive}>
      <td>
        <SourceItem key={id}>
          <SourceSquare
            onClick={() => {
              update(id, {
                enabled: !enabled,
              });
            }}
            color={color}
            fade={!enabled}
          />
          {call && (
            <div style={{ marginRight: 10 }}>
              <FunctionCall
                id={call.functionId}
                callId={call.callId}
                renderLoading={() => renderStatusIcon('Running')}
                renderCall={({ status }) => renderStatusIcon(status)}
              />
            </div>
          )}
          <SourceName>{name || 'noname'}</SourceName>
          <SourceMenu onClick={(e) => e.stopPropagation()} key={idHack}>
            <Dropdown
              content={
                <WorkflowMenu
                  chartId={chart.id}
                  id={id}
                  closeMenu={() => setIdHack(idHack + 1)}
                />
              }
            >
              <Icon type="VerticalEllipsis" />
            </Dropdown>
          </SourceMenu>
        </SourceItem>
      </td>
      {isWorkspaceMode && (
        <>
          <td>
            <SourceItem>
              <SourceName>*</SourceName>
            </SourceItem>
          </td>
          <td>
            <SourceItem>
              <SourceName>*</SourceName>
            </SourceItem>
          </td>
          <td>
            <SourceItem>
              <SourceName>-</SourceName>
            </SourceItem>
          </td>
          <td>
            <SourceItem>
              <SourceName>-</SourceName>
            </SourceItem>
          </td>
        </>
      )}
      {isDataQualityMode && (
        <>
          <td>
            <SourceItem>
              <SourceName>-</SourceName>
            </SourceItem>
          </td>
          <td>
            <SourceItem>
              <SourceName>-</SourceName>
            </SourceItem>
          </td>
        </>
      )}
    </SourceRow>
  );
}
