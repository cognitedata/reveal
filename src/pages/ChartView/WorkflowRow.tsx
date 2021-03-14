import React from 'react';
import {
  Chart,
  ChartWorkflow,
  FunctionCallStatus,
} from 'reducers/charts/types';
import { Dropdown, Icon, Menu } from '@cognite/cogs.js';
import { AppearanceDropdown } from 'components/AppearanceDropdown';
import FunctionCall from 'components/FunctionCall';
import {
  SourceItem,
  SourceSquare,
  SourceMenu,
  SourceName,
  SourceRow,
} from './elements';

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
  const { id, enabled, color, name, calls } = workflow;
  const call = calls?.sort((c) => c.callDate)[0];

  const update = (wfId: string, diff: Partial<ChartWorkflow>) =>
    mutate({
      ...chart,
      workflowCollection: chart.workflowCollection?.map((wf) =>
        wf.id === wfId
          ? {
              ...wf,
              ...diff,
            }
          : wf
      ),
    });

  const remove = (wfId: string) =>
    mutate({
      ...chart,
      workflowCollection: chart.workflowCollection?.filter(
        (wf) => wf.id !== wfId
      ),
    });

  return (
    <SourceRow
      key={id}
      onClick={() => setActiveSourceItem(id)}
      isActive={isActive}
    >
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
          <SourceMenu onClick={(e) => e.stopPropagation()}>
            <Dropdown
              content={
                <Menu>
                  <Menu.Header>
                    <span style={{ wordBreak: 'break-word' }}>{name}</span>
                  </Menu.Header>
                  <Menu.Submenu
                    content={
                      <AppearanceDropdown
                        onColorSelected={(newColor) =>
                          update(id, { color: newColor })
                        }
                        onWeightSelected={(newWeight) =>
                          update(id, { lineWeight: newWeight })
                        }
                        onStyleSelected={(newStyle) =>
                          update(id, { lineStyle: newStyle })
                        }
                      />
                    }
                  >
                    <span>Appearance</span>
                  </Menu.Submenu>
                  <Menu.Item
                    onClick={() => {
                      // eslint-disable-next-line no-alert
                      const newName = prompt('Rename calculation');
                      if (newName) {
                        update(id, {
                          name: newName,
                        });
                      }
                    }}
                    appendIcon="Edit"
                  >
                    <span>Rename</span>
                  </Menu.Item>
                  <Menu.Item
                    onClick={() => {
                      remove(id);
                      if (isActive) {
                        setActiveSourceItem(undefined);
                      }
                    }}
                    appendIcon="Delete"
                  >
                    <span>Remove</span>
                  </Menu.Item>
                </Menu>
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
