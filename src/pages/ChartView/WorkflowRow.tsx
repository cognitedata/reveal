import {
  CalculationStatusStatusEnum,
  Calculation,
} from '@cognite/calculation-backend';
import {
  Button,
  Dropdown,
  Icon,
  Menu,
  Popconfirm,
  Tooltip,
} from '@cognite/cogs.js';

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
import { getStepsFromWorkflow } from 'utils/transforms';
import { convertValue } from 'utils/units';
import {
  SourceDescription,
  SourceItem,
  SourceName,
  SourceRow,
  SourceSquare,
} from './elements';
import WorkflowMenu from './WorkflowMenu';

const renderStatusIcon = (status?: CalculationStatusStatusEnum) => {
  switch (status) {
    case CalculationStatusStatusEnum.Pending:
    case CalculationStatusStatusEnum.Running:
      return <Icon type="Loading" />;
    case CalculationStatusStatusEnum.Success:
      return <Icon type="Checkmark" />;
    case CalculationStatusStatusEnum.Failed:
    case CalculationStatusStatusEnum.Error:
      return <Icon type="ExclamationMark" title="Failed" />;
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

  const update = (wfId: string, diff: Partial<ChartWorkflow>) => {
    mutate((oldChart) => updateWorkflow(oldChart!, wfId, diff));
  };

  const steps = useMemo(
    () =>
      isWorkflowRunnable(workflow) ? getStepsFromWorkflow(chart, workflow) : [],
    [chart, workflow]
  );

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

    const isComputationValid =
      computationCopy.steps.length &&
      computationCopy.steps.every((step) => step.inputs.length);
    if (!isComputationValid) {
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
      }
    );
  }, [stringifiedComputation, createCalculation, mutate, workflow.id]);

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

  const updateAppearance = (diff: Partial<ChartTimeSeries>) =>
    mutate((oldChart) => updateWorkflow(oldChart!, id, diff));

  return (
    <SourceRow
      onClick={() => onRowClick(id)}
      className={isSelected ? 'active' : undefined}
      onDoubleClick={openNodeEditor}
      ref={draggable ? provided?.innerRef : null}
      {...provided?.draggableProps}
      {...provided?.dragHandleProps}
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
              <CalculationCallStatus
                id={call.callId}
                renderLoading={() =>
                  renderStatusIcon(CalculationStatusStatusEnum.Running)
                }
                renderStatus={({ status }) => renderStatusIcon(status)}
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
            <UnitDropdown
              unit={unit}
              preferredUnit={preferredUnit}
              onOverrideUnitClick={updateUnit}
              onConversionUnitClick={updatePrefferedUnit}
              onResetUnitClick={resetUnit}
            />
          </td>
          <td className="downloadChartHide" />
          <td
            style={{ textAlign: 'center', paddingLeft: 0 }}
            className="downloadChartHide"
          >
            <Dropdown
              content={<AppearanceDropdown update={updateAppearance} />}
            >
              <Button
                type="ghost"
                icon="ResourceTimeseries"
                style={{ height: 28 }}
                aria-label="timeseries"
              />
            </Dropdown>
          </td>
          <td
            style={{ textAlign: 'center', paddingLeft: 0 }}
            className="downloadChartHide"
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
            className="downloadChartHide"
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
            className="downloadChartHide"
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
