import {
  CalculationStatusStatusEnum,
  Calculation,
} from '@cognite/calculation-backend';
import { Button, Dropdown, Menu, Popconfirm, Tooltip } from '@cognite/cogs.js';
import { workflowsAtom } from 'models/workflows/atom';
import { AppearanceDropdown } from 'components/AppearanceDropdown';
import CalculationCallStatus from 'components/CalculationCallStatus';
import EditableText from 'components/EditableText';
import {
  convertWorkflowToV1,
  isWorkflowRunnable,
} from 'components/NodeEditor/utils';
import { UnitDropdown } from 'components/UnitDropdown';
import { flow, isEqual } from 'lodash';
import { useCallback, useEffect, useMemo, useState } from 'react';
import { DraggableProvided } from 'react-beautiful-dnd';
import { useRecoilState } from 'recoil';
import { Chart, ChartTimeSeries, ChartWorkflow } from 'models/chart/types';
import { useDebounce } from 'use-debounce';
import { formatCalculationResult } from 'services/calculation-backend';
import {
  useCalculationResult,
  useCalculationStatus,
  useCreateCalculation,
} from 'hooks/calculation-backend';
import { removeWorkflow, updateWorkflow } from 'models/chart/updates';
import { getHash } from 'utils/hash';
import { calculateGranularity } from 'utils/timeseries';
import { convertValue } from 'utils/units';
import { getIconTypeFromStatus } from 'components/StatusIcon/StatusIcon';
import { useAvailableOps } from 'components/NodeEditor/AvailableOps';
import { getStepsFromWorkflow } from 'components/NodeEditor/transforms';
import { validateSteps } from 'components/NodeEditor/V2/calculations';
import { StyleButton } from 'components/StyleButton/StyleButton';
import {
  SourceDescription,
  SourceItem,
  SourceName,
  SourceRow,
  SourceStatus,
  StyledStatusIcon,
} from './elements';
import WorkflowMenu from './WorkflowMenu';

type Props = {
  chart: Chart;
  workflow: ChartWorkflow;
  isSelected?: boolean;
  onRowClick?: (id?: string) => void;
  onInfoClick?: (id?: string) => void;
  openNodeEditor?: () => void;
  mode: string;
  mutate: (update: (c: Chart | undefined) => Chart) => void;
  draggable?: boolean;
  provided?: DraggableProvided | undefined;
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
  draggable = false,
  provided = undefined,
}: Props) {
  const [, setWorkflowState] = useRecoilState(workflowsAtom);
  const { mutate: createCalculation, isLoading: isCallLoading } =
    useCreateCalculation();
  const [isEditingName, setIsEditingName] = useState<boolean>(false);
  const { id, enabled, color, name, calls, unit, preferredUnit } = workflow;
  const call = calls?.sort((c) => c.callDate)[0];
  const isWorkspaceMode = mode === 'workspace';

  const [, , operations] = useAvailableOps();

  const update = useCallback(
    (wfId: string, diff: Partial<ChartWorkflow>) => {
      mutate((oldChart) => updateWorkflow(oldChart!, wfId, diff));
    },
    [mutate]
  );

  const steps = useMemo(
    () =>
      isWorkflowRunnable(workflow) ? getStepsFromWorkflow(chart, workflow) : [],
    [chart, workflow]
  ) as Calculation['steps'];

  const isStepsValid =
    workflow.version === 'v2' ? validateSteps(steps, operations) : true;

  const [{ dateFrom, dateTo }] = useDebounce(
    { dateFrom: chart.dateFrom, dateTo: chart.dateTo },
    2000,
    {
      equalityFn: isEqual,
    }
  );

  const computation: Calculation = useMemo(
    () => ({
      steps: steps as any,
      start_time: new Date(dateFrom).getTime(),
      end_time: new Date(dateTo).getTime(),
      granularity: calculateGranularity(
        [new Date(dateFrom).getTime(), new Date(dateTo).getTime()],
        1000
      ),
    }),
    [steps, dateFrom, dateTo]
  );

  const stringifiedComputation = JSON.stringify(computation);

  const runComputation = useCallback(() => {
    const computationCopy: Calculation = JSON.parse(stringifiedComputation);

    if (!isStepsValid) {
      mutate((oldChart) =>
        updateWorkflow(oldChart!, workflow.id, {
          calls: [],
        })
      );
      setWorkflowState((workflows) => ({
        ...workflows,
        [id]: {
          id,
          loading: false,
          datapoints: [],
        },
      }));
      return;
    }

    createCalculation(
      { definition: computationCopy },
      {
        onSuccess(res) {
          mutate((oldChart) =>
            updateWorkflow(oldChart!, workflow.id, {
              calls: [
                {
                  ...res,
                  callId: res.id, // (eiriklv): Clean this up
                  callDate: Date.now(),
                  hash: getHash(computationCopy),
                },
              ],
            })
          );
        },
        onError() {
          mutate((oldChart) =>
            updateWorkflow(oldChart!, workflow.id, {
              calls: [],
            })
          );
          setWorkflowState((workflows) => ({
            ...workflows,
            [id]: {
              id,
              loading: false,
              datapoints: [],
            },
          }));
        },
      }
    );
  }, [
    id,
    setWorkflowState,
    stringifiedComputation,
    createCalculation,
    mutate,
    workflow.id,
    isStepsValid,
  ]);

  const currentCallStatus = useCalculationStatus(call?.callId!);

  const handleRetries = useCallback(() => {
    if (isCallLoading) {
      return;
    }

    if (!call) {
      return;
    }

    if (!currentCallStatus.isError) {
      return;
    }

    if (
      currentCallStatus.data?.status &&
      !['Failed', 'Timeout'].includes(currentCallStatus.data.status)
    ) {
      return;
    }

    runComputation();
  }, [call, currentCallStatus, runComputation, isCallLoading]);

  const handleChanges = useCallback(() => {
    const computationCopy = JSON.parse(stringifiedComputation);

    if (call?.hash === getHash(computationCopy)) {
      return;
    }

    runComputation();
  }, [stringifiedComputation, runComputation, call]);

  useEffect(handleRetries, [handleRetries]);
  useEffect(handleChanges, [handleChanges]);

  const { data: calculationResult } = useCalculationResult(call?.callId, {
    enabled: currentCallStatus.data?.status === 'Success',
  });

  useEffect(() => {
    setWorkflowState((workflows) => ({
      ...workflows,
      [id]: {
        id,
        loading: currentCallStatus.data?.status !== 'Success',
        datapoints: calculationResult
          ? formatCalculationResult(calculationResult)
          : workflows[id]?.datapoints || [],
      },
    }));
  }, [id, calculationResult, setWorkflowState, currentCallStatus.data?.status]);

  const remove = () => mutate((oldChart) => removeWorkflow(oldChart!, id));

  const updateUnit = (unitOption: any) => {
    const currentInputUnit = workflow.unit;
    const currentOutputUnit = workflow.preferredUnit;
    const nextInputUnit = unitOption?.value;

    const min = workflow.range?.[0];
    const max = workflow.range?.[1];
    const hasValidRange = typeof min === 'number' && typeof max === 'number';

    const convertFromTo =
      (inputUnit?: string, outputUnit?: string) => (value: number) =>
        convertValue(value, inputUnit, outputUnit);

    const convert = flow(
      convertFromTo(currentOutputUnit, currentInputUnit),
      convertFromTo(nextInputUnit, currentOutputUnit)
    );

    const range = hasValidRange ? [convert(min!), convert(max!)] : [];

    /**
     * Update unit and corresponding converted range
     */
    update(id, {
      unit: unitOption.value,
      range,
    });
  };

  const updatePrefferedUnit = (unitOption: any) => {
    const currentInputUnit = workflow.unit;
    const currentOutputUnit = workflow.preferredUnit;
    const nextOutputUnit = unitOption?.value;

    const min = workflow.range?.[0];
    const max = workflow.range?.[1];

    const hasValidRange = typeof min === 'number' && typeof max === 'number';

    const convertFromTo =
      (inputUnit?: string, outputUnit?: string) => (value: number) =>
        convertValue(value, inputUnit, outputUnit);

    const convert = flow(
      convertFromTo(currentOutputUnit, currentInputUnit),
      convertFromTo(currentInputUnit, nextOutputUnit)
    );

    const range = hasValidRange ? [convert(min!), convert(max!)] : [];

    /**
     * Update unit and corresponding converted range
     */
    update(id, {
      preferredUnit: unitOption?.value,
      range,
    });
  };

  const resetUnit = async () => {
    const currentInputUnit = workflow.unit;
    const currentOutputUnit = workflow.preferredUnit;

    const min = workflow.range?.[0];
    const max = workflow.range?.[1];
    const hasValidRange = typeof min === 'number' && typeof max === 'number';

    const range = hasValidRange
      ? [
          convertValue(min!, currentOutputUnit, currentInputUnit),
          convertValue(max!, currentOutputUnit, currentInputUnit),
        ]
      : [];

    /**
     * Update units and corresponding converted range
     */
    update(id, {
      unit: '',
      preferredUnit: '',
      range,
    });
  };

  const handleUpdateAppearance = (diff: Partial<ChartTimeSeries>) =>
    mutate((oldChart) => updateWorkflow(oldChart!, id, diff));

  const handleStatusIconClick = useCallback(
    (event) => {
      event.stopPropagation();
      update(id, {
        enabled: !enabled,
      });
    },
    [enabled, id, update]
  );

  return (
    <SourceRow
      onClick={() => onRowClick(id)}
      aria-hidden={!enabled}
      aria-selected={isSelected}
      onDoubleClick={openNodeEditor}
      ref={draggable ? provided?.innerRef : null}
      {...provided?.draggableProps}
      {...provided?.dragHandleProps}
    >
      {isWorkspaceMode && (
        <td
          style={{ textAlign: 'center', paddingLeft: 0 }}
          className="downloadChartHide"
        >
          <Dropdown
            disabled={!enabled}
            content={<AppearanceDropdown onUpdate={handleUpdateAppearance} />}
          >
            <StyleButton
              styleType="Function"
              styleColor={color}
              label="Workflow Function"
            />
          </Dropdown>
        </td>
      )}
      <td>
        <SourceItem key={id}>
          <SourceStatus
            onClick={handleStatusIconClick}
            onDoubleClick={(event) => event.stopPropagation()}
          >
            {!call && (
              <StyledStatusIcon
                type={enabled ? 'EyeShow' : 'EyeHide'}
                title="Toggle visibility"
              />
            )}
            {call && (
              <CalculationCallStatus
                id={call.callId}
                renderLoading={() => (
                  <StyledStatusIcon
                    type={getIconTypeFromStatus(
                      CalculationStatusStatusEnum.Running
                    )}
                    title="Toggle visibility"
                  />
                )}
                renderStatus={({ status }) => (
                  <StyledStatusIcon
                    type={getIconTypeFromStatus(status)}
                    title="Toggle visibility"
                  />
                )}
              />
            )}
          </SourceStatus>
          {currentCallStatus.isError && (
            <SourceName>
              <span style={{ color: 'var(--cogs-red)', marginRight: 5 }}>
                [Error]
              </span>
            </SourceName>
          )}
          <SourceName>
            <EditableText
              isError={currentCallStatus.isError}
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
          <td className="bordered" />
          <td className="bordered">
            <SourceName>
              <SourceDescription>
                <Tooltip content={name || 'noname'}>
                  <>{name || 'noname'}</>
                </Tooltip>
              </SourceDescription>
            </SourceName>
          </td>
          <td className="bordered" />
          <td className="bordered" />
          <td className="bordered" />
          <td className="col-unit">
            <UnitDropdown
              disabled={!enabled}
              unit={unit}
              preferredUnit={preferredUnit}
              onOverrideUnitClick={updateUnit}
              onConversionUnitClick={updatePrefferedUnit}
              onResetUnitClick={resetUnit}
            />
          </td>
          <td className="downloadChartHide col-action" title="P&amp;IDS" />
          <td
            style={{ textAlign: 'center', paddingLeft: 0 }}
            className="downloadChartHide col-action"
          >
            <Popconfirm
              onConfirm={remove}
              okText="Remove"
              content={
                <div style={{ textAlign: 'left' }}>
                  Remove this calculation?
                </div>
              }
            >
              <Button
                type="ghost"
                icon="Trash"
                style={{ height: 28 }}
                aria-label="delete"
              />
            </Popconfirm>
          </td>
          <td
            style={{ textAlign: 'center', paddingLeft: 0 }}
            className="downloadChartHide col-action"
          >
            <Button
              type="ghost"
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
          <td
            style={{ textAlign: 'center', paddingLeft: 0 }}
            className="downloadChartHide col-action"
          >
            <Dropdown
              content={
                <WorkflowMenu chart={chart} id={id}>
                  <Menu.Item onClick={openNodeEditor} appendIcon="Function">
                    <span>Edit calculation</span>
                  </Menu.Item>
                  {workflow.version === 'v2' && (
                    <Menu.Item
                      onClick={() => {
                        update(id, convertWorkflowToV1(workflow));
                        openNodeEditor();
                      }}
                    >
                      <span>Edit calculation in legacy node editor</span>
                    </Menu.Item>
                  )}
                </WorkflowMenu>
              }
            >
              <Button
                type="ghost"
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
