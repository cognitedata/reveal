import React, { useCallback, useEffect, useMemo, useState } from 'react';
import {
  Chart,
  ChartWorkflow,
  FunctionCallStatus,
  ChartTimeSeries,
  Call,
} from 'reducers/charts/types';
import {
  Button,
  Dropdown,
  Icon,
  Menu,
  Popconfirm,
  Flex,
  Tooltip,
} from '@cognite/cogs.js';
import FunctionCall from 'components/FunctionCall';
import { updateWorkflow, removeWorkflow } from 'utils/charts';
import EditableText from 'components/EditableText';
import { units } from 'utils/units';
import { useCallFunction, useFunctionCall } from 'utils/backendService';
import { getStepsFromWorkflow } from 'utils/transforms';
import { calculateGranularity } from 'utils/timeseries';
import { isWorkflowRunnable } from 'components/NodeEditor/utils';
import { AppearanceDropdown } from 'components/AppearanceDropdown';
import { getHash } from 'utils/hash';
import {
  SourceItem,
  SourceSquare,
  SourceName,
  SourceRow,
  UnitMenuAside,
  UnitMenuHeader,
  SourceDescription,
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
  isSelected?: boolean;
  onRowClick?: (id?: string) => void;
  onInfoClick?: (id?: string) => void;
  openNodeEditor?: () => void;
  mode: string;
  mutate: (c: Chart) => void;
};
export default function WorkflowRow({
  chart,
  workflow,
  onRowClick = () => {},
  onInfoClick = () => {},
  mode,
  openNodeEditor = () => {},
  isSelected = false,
  mutate,
}: Props) {
  const { mutate: callFunction, isSuccess } = useCallFunction(
    'simple_calc-master'
  );

  const [isEditingName, setIsEditingName] = useState<boolean>(false);
  const [lastSuccessfulCall, setLastSuccessfulCall] = useState<Call>();
  const { id, enabled, color, name, calls, unit, preferredUnit } = workflow;
  const call = calls?.sort((c) => c.callDate)[0];
  const isWorkspaceMode = mode === 'workspace';

  const update = (wfId: string, diff: Partial<ChartWorkflow>) => {
    mutate(updateWorkflow(chart, wfId, diff));
  };

  const { dateTo, dateFrom } = chart;
  const { nodes, connections } = workflow;
  const steps = useMemo(
    () =>
      isWorkflowRunnable(nodes) &&
      getStepsFromWorkflow(chart, nodes, connections),
    [chart, nodes, connections]
  );

  const computation = useMemo(
    () =>
      steps && {
        steps,
        start_time: new Date(dateFrom).getTime(),
        end_time: new Date(dateTo).getTime(),
        granularity: calculateGranularity(
          [new Date(dateFrom).getTime(), new Date(dateTo).getTime()],
          1000
        ),
      },
    [steps, dateFrom, dateTo]
  );

  const runComputation = useCallback(() => {
    callFunction(
      {
        data: { computation_graph: computation },
      },
      {
        onSuccess(res) {
          setLastSuccessfulCall(res);
        },
      }
    );
  }, [computation, callFunction, setLastSuccessfulCall]);

  const currentCallStatus = useFunctionCall(call?.functionId!, call?.callId!);

  useEffect(() => {
    if (!call) {
      return;
    }

    if (!currentCallStatus.isError) {
      return;
    }

    if (
      !['Failed', 'Timeout'].includes(currentCallStatus?.data?.status || '')
    ) {
      return;
    }

    runComputation();
  }, [call, currentCallStatus, runComputation]);

  useEffect(() => {
    if (!computation) {
      return;
    }
    if (call?.hash === getHash(computation)) {
      return;
    }

    runComputation();
  }, [computation, runComputation, call]);

  useEffect(() => {
    if (!computation) {
      return;
    }
    if (!lastSuccessfulCall) {
      return;
    }
    if (call?.callId === lastSuccessfulCall.callId) {
      return;
    }

    const newCall = {
      ...lastSuccessfulCall,
      callDate: Date.now(),
      hash: getHash(computation),
    };

    mutate(
      updateWorkflow(chart, workflow.id, {
        calls: [newCall],
      })
    );
  }, [
    chart,
    workflow.id,
    isSuccess,
    mutate,
    computation,
    lastSuccessfulCall,
    call,
  ]);

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
      style={
        unit?.toLowerCase() === unitOption.value
          ? {
              color: 'var(--cogs-midblue-3)',
              backgroundColor: 'var(--cogs-midblue-6)',
              borderRadius: 3,
            }
          : {}
      }
    >
      {unitOption.label}
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
      style={
        preferredUnit?.toLowerCase() === unitOption?.value
          ? {
              color: 'var(--cogs-midblue-3)',
              backgroundColor: 'var(--cogs-midblue-6)',
              borderRadius: 3,
            }
          : {}
      }
    >
      {unitOption?.label}
    </Menu.Item>
  ));

  const remove = () => mutate(removeWorkflow(chart, id));

  const updateAppearance = (diff: Partial<ChartTimeSeries>) =>
    mutate(updateWorkflow(chart, id, diff));

  return (
    <SourceRow
      onClick={() => onRowClick(id)}
      className={isSelected ? 'active' : undefined}
    >
      <td>
        <SourceItem key={id}>
          <SourceSquare
            onClick={(event) => {
              event.stopPropagation();
              update(id, {
                enabled: !enabled,
              });
            }}
            color={color}
            fade={!enabled}
          />
          {call && (
            <div
              style={{
                marginRight: 10,
                height: '100%',
                display: 'flex',
                alignItems: 'center',
              }}
            >
              <FunctionCall
                id={call.functionId}
                callId={call.callId}
                renderLoading={() => renderStatusIcon('Running')}
                renderCall={({ status }) => renderStatusIcon(status)}
              />
            </div>
          )}
          <SourceName>
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
        </SourceItem>
      </td>
      {isWorkspaceMode && (
        <>
          <td>
            <SourceName>
              <SourceDescription>
                <Tooltip content={name || 'noname'}>
                  <>{name || 'noname'}</>
                </Tooltip>
              </SourceDescription>
            </SourceName>
          </td>
          <td colSpan={4} />
          <td style={{ textAlign: 'right', paddingRight: 8 }}>
            <Dropdown
              content={
                <Menu>
                  <Flex
                    direction="row"
                    style={{ height: 150, overflow: 'hidden' }}
                  >
                    <div style={{ overflowY: 'scroll' }}>
                      <Menu.Header>
                        <UnitMenuHeader>Input</UnitMenuHeader>
                      </Menu.Header>
                      {unitOverrideMenuItems}
                    </div>
                    <UnitMenuAside style={{ overflowY: 'scroll' }}>
                      <Menu.Header>
                        <UnitMenuHeader>Output</UnitMenuHeader>
                      </Menu.Header>
                      {unitConversionMenuItems}
                    </UnitMenuAside>
                  </Flex>
                </Menu>
              }
            >
              <Button
                icon="Down"
                type="tertiary"
                iconPlacement="right"
                style={{ height: 28 }}
              >
                {preferredUnitOption?.label || '-'}
              </Button>
            </Dropdown>
          </td>
          <td />
          <td style={{ textAlign: 'center', paddingLeft: 0 }}>
            <Dropdown
              content={<AppearanceDropdown update={updateAppearance} />}
            >
              <Button
                type="tertiary"
                icon="Timeseries"
                style={{ height: 28 }}
                aria-label="timeseries"
              />
            </Dropdown>
          </td>
          <td style={{ textAlign: 'center', paddingLeft: 0 }}>
            <Popconfirm
              onConfirm={remove}
              content={
                <div style={{ textAlign: 'left' }}>
                  Are you sure that you want to
                  <br /> remove this calculation?
                </div>
              }
            >
              <Button
                type="tertiary"
                icon="Delete"
                style={{ height: 28 }}
                aria-label="delete"
              />
            </Popconfirm>
          </td>
          <td style={{ textAlign: 'center', paddingLeft: 0 }}>
            <Button
              type="tertiary"
              icon="Info"
              onClick={(event) => {
                if (isSelected) {
                  event.stopPropagation();
                }
                onInfoClick(id);
              }}
              style={{ height: 28 }}
              aria-label="info"
            />
          </td>
          <td style={{ textAlign: 'center', paddingLeft: 0 }}>
            <Dropdown
              content={
                <WorkflowMenu chart={chart} id={id}>
                  <Menu.Item onClick={openNodeEditor} appendIcon="YAxis">
                    <span>Edit calculation</span>
                  </Menu.Item>
                </WorkflowMenu>
              }
            >
              <Button
                type="tertiary"
                icon="MoreOverflowEllipsisHorizontal"
                style={{ height: 28 }}
                aria-label="more"
              />
            </Dropdown>
          </td>
        </>
      )}
    </SourceRow>
  );
}
