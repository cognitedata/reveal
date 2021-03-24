import React, { useState } from 'react';
import {
  Chart,
  ChartWorkflow,
  FunctionCallStatus,
} from 'reducers/charts/types';
import { Dropdown, Icon, Menu } from '@cognite/cogs.js';
import FunctionCall from 'components/FunctionCall';
import { updateWorkflow } from 'utils/charts';
import EditableText from 'components/EditableText';
import { units } from 'utils/units';
import { Modes } from 'pages/types';
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
  isActive: boolean;
  setWorkspaceMode: (m: Modes) => void;
  mutate: (c: Chart) => void;
};
export default function WorkflowRow({
  chart,
  workflow,
  setWorkspaceMode,
  setActiveSourceItem,
  isActive = false,
  mutate,
}: Props) {
  const [isEditingName, setIsEditingName] = useState<boolean>(false);

  // Increasing this will cause a fresh render where the dropdown is closed
  const [idHack, setIdHack] = useState(0);
  const { id, enabled, color, name, calls, unit, preferredUnit } = workflow;
  const call = calls?.sort((c) => c.callDate)[0];

  const update = (wfId: string, diff: Partial<ChartWorkflow>) => {
    mutate(updateWorkflow(chart, wfId, diff));
  };

  const inputUnitOption = units.find(
    (unitOption) => unitOption.value === unit?.toLowerCase()
  );

  const preferredUnitOption = units.find(
    (unitOption) => unitOption.value === preferredUnit?.toLowerCase()
  );

  const unitConversionOptions = inputUnitOption?.conversions?.map(
    (conversion) => units.find((unitOption) => unitOption.value === conversion)
  );

  const unitOverrideMenuItems = units.map((unitOption) => (
    <Menu.Item
      key={unitOption.value}
      onClick={() =>
        update(id, {
          unit: unitOption.value,
        })
      }
    >
      {unitOption.label}
      {unit?.toLowerCase() === unitOption.value && ' (selected)'}
    </Menu.Item>
  ));

  const unitConversionMenuItems = unitConversionOptions?.map((unitOption) => (
    <Menu.Item
      key={unitOption?.value}
      onClick={() =>
        update(id, {
          preferredUnit: unitOption?.value,
        })
      }
    >
      {unitOption?.label}{' '}
      {preferredUnit?.toLowerCase() === unitOption?.value && ' (selected)'}
    </Menu.Item>
  ));

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
          <SourceName onClick={() => setWorkspaceMode('editor')}>
            <EditableText
              value={name || 'noname'}
              onChange={(value) => {
                update(id, { name: value });
                setIsEditingName(false);
              }}
              onCancel={() => setIsEditingName(false)}
              editing={isEditingName}
              hideButtons
            />
          </SourceName>
          <SourceMenu onClick={(e) => e.stopPropagation()} key={idHack}>
            <Dropdown
              content={
                <WorkflowMenu
                  chartId={chart.id}
                  id={id}
                  closeMenu={() => setIdHack(idHack + 1)}
                  startRenaming={() => setIsEditingName(true)}
                />
              }
            >
              <Icon type="VerticalEllipsis" />
            </Dropdown>
          </SourceMenu>
        </SourceItem>
      </td>
      <td>
        <Dropdown
          content={
            <Menu>
              <Menu.Header>
                <span style={{ wordBreak: 'break-word' }}>
                  Select input unit (override)
                </span>
              </Menu.Header>
              {unitOverrideMenuItems}
            </Menu>
          }
        >
          <SourceItem>
            <SourceName>{inputUnitOption?.label || '-'}</SourceName>
          </SourceItem>
        </Dropdown>
      </td>
      <td>
        <Dropdown
          content={
            <Menu>
              <Menu.Header>
                <span style={{ wordBreak: 'break-word' }}>
                  Select preferred unit
                </span>
              </Menu.Header>
              {unitConversionMenuItems}
            </Menu>
          }
        >
          <SourceItem>
            <SourceName>{preferredUnitOption?.label || '-'}</SourceName>
          </SourceItem>
        </Dropdown>
      </td>
      <td colSpan={2} />
    </SourceRow>
  );
}
