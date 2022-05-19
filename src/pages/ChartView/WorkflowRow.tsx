import {
  StatusStatusEnum,
  Calculation,
  CalculationResultQueryAggregateEnum,
} from '@cognite/calculation-backend';
import { Button, Popconfirm, Tooltip } from '@cognite/cogs.js';
import { workflowsAtom } from 'models/workflows/atom';
import AppearanceDropdown from 'components/AppearanceDropdown/AppearanceDropdown';
import CalculationCallStatus from 'components/CalculationCallStatus/CalculationCallStatus';
import { isWorkflowRunnable } from 'components/NodeEditor/utils';
import UnitDropdown from 'components/UnitDropdown/UnitDropdown';
import { flow, isEqual } from 'lodash';
import { useCallback, useEffect, useMemo, useState } from 'react';
import { DraggableProvided } from 'react-beautiful-dnd';
import { useRecoilState, useRecoilValue } from 'recoil';
import { Chart, ChartTimeSeries, ChartWorkflow } from 'models/chart/types';
import { useDebounce } from 'use-debounce';
import {
  useCalculationQueryResult,
  useCalculationStatus,
  useCreateCalculation,
} from 'hooks/calculation-backend';
import {
  duplicateWorkflow,
  removeWorkflow,
  updateWorkflow,
} from 'models/chart/updates';
import { getHash } from 'utils/hash';
import { calculateGranularity } from 'utils/timeseries';
import { convertValue, getUnitConverter } from 'utils/units';
import { getIconTypeFromStatus } from 'components/StatusIcon/StatusIcon';
import { useAvailableOps } from 'components/NodeEditor/AvailableOps';
import { getStepsFromWorkflow } from 'components/NodeEditor/transforms';
import { validateSteps } from 'components/NodeEditor/V2/calculations';
import { StyleButton } from 'components/StyleButton/StyleButton';
import { useTranslations } from 'hooks/translations';
import { makeDefaultTranslations } from 'utils/translations';
import TranslatedEditableText from 'components/EditableText/TranslatedEditableText';
import Dropdown from 'components/Dropdown/Dropdown';
import { trackUsage } from 'services/metrics';
import chartAtom from 'models/chart/atom';
import dayjs from 'dayjs';
import { CHART_POINTS_PER_SERIES } from 'utils/constants';
import { formatValueForDisplay } from 'utils/numbers';
import { workflowsSummaryById } from 'models/workflows/selectors';
import {
  DropdownWithoutMaxWidth,
  SourceDescription,
  SourceItem,
  SourceName,
  SourceRow,
  SourceStatus,
  StyledErrorIcon,
  StyledStatusIcon,
  StyledVisibilityIcon,
} from './elements';

type Props = {
  chart: Chart;
  workflow: ChartWorkflow;
  isSelected?: boolean;
  onRowClick?: (id?: string) => void;
  onInfoClick?: (id?: string) => void;
  onThresholdClick?: (id?: string) => void;
  openNodeEditor?: () => void;
  mode: string;
  mutate: (update: (c: Chart | undefined) => Chart) => void;
  draggable?: boolean;
  provided?: DraggableProvided | undefined;
  translations: typeof defaultTranslations;
};

/**
 * Workflow translations
 */
const defaultTranslations = makeDefaultTranslations(
  'Remove',
  'Cancel',
  'Remove this calculation?',
  'Edit calculation',
  'Duplicate',
  'Threshold'
);

function WorkflowRow({
  chart,
  workflow,
  onRowClick = () => {},
  onInfoClick = () => {},
  onThresholdClick = () => {},
  mode,
  openNodeEditor = () => {},
  isSelected = false,
  mutate,
  draggable = false,
  provided = undefined,
  translations,
}: Props) {
  const [, setWorkflowState] = useRecoilState(workflowsAtom);
  const { mutate: createCalculation, isLoading: isCallLoading } =
    useCreateCalculation();
  const [isEditingName, setIsEditingName] = useState<boolean>(false);
  const [, setChart] = useRecoilState(chartAtom);
  const {
    id,
    enabled,
    color = '',
    lineStyle = 'solid',
    lineWeight = 1,
    interpolation = 'linear',
    name,
    calls,
    unit,
    preferredUnit,
    customUnitLabel,
  } = workflow;
  const call = [...(calls || [])].sort((c) => c.callDate)[0];
  const isWorkspaceMode = mode === 'workspace';

  const [, , operations] = useAvailableOps();

  const t = { ...defaultTranslations, ...translations };

  const update = useCallback(
    (wfId: string, diff: Partial<ChartWorkflow>) => {
      mutate((oldChart) => updateWorkflow(oldChart!, wfId, diff));
    },
    [mutate]
  );

  const steps = useMemo(
    () =>
      isWorkflowRunnable(workflow)
        ? getStepsFromWorkflow(chart, workflow, operations)
        : [],
    [chart, workflow, operations]
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
      /**
       * Use raw data for all steps
       */
      steps: steps.map((step) => {
        return {
          ...step,
          raw: true,
        };
      }),
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
    if (!enabled) {
      return;
    }

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

    const computationCopy: Calculation = JSON.parse(stringifiedComputation);

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
    enabled,
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

  const resultQuery = useMemo(() => {
    return {
      items: [],
      start: new Date(dateFrom).getTime(),
      end: new Date(dateTo).getTime(),
      granularity: calculateGranularity(
        [dayjs(dateFrom).valueOf(), dayjs(dateTo).valueOf()],
        CHART_POINTS_PER_SERIES
      ),
      aggregates: [
        'average',
        'min',
        'max',
        'count',
        'sum',
      ] as CalculationResultQueryAggregateEnum[],
      limit: CHART_POINTS_PER_SERIES,
    };
  }, [dateFrom, dateTo]);

  const { data: calculationResult } = useCalculationQueryResult(
    call?.callId,
    resultQuery,
    {
      enabled: currentCallStatus.data?.status === 'Success',
    }
  );

  useEffect(() => {
    setWorkflowState((workflows) => ({
      ...workflows,
      [id]: {
        id,
        loading: currentCallStatus.data?.status !== 'Success',
        datapoints: calculationResult
          ? calculationResult.datapoints
          : workflows[id]?.datapoints || [],
        warnings: calculationResult?.warnings || [],
        error: calculationResult?.error,
        isDownsampled:
          calculationResult?.isDownsampled ?? workflows[id]?.isDownsampled,
      },
    }));
  }, [id, calculationResult, setWorkflowState, currentCallStatus.data?.status]);

  /**
   * Unit Dropdown translations
   */
  const { t: unitDropdownTranslations } = useTranslations(
    UnitDropdown.translationKeys,
    'UnitDropdown'
  );

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

  const updateCustomUnitLabel = async (label: string) => {
    update(id, {
      customUnitLabel: label,
      preferredUnit: '',
      unit: '',
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

  const summary = useRecoilValue(workflowsSummaryById(id));
  const convertUnit = getUnitConverter(unit, preferredUnit);
  const resultError = calculationResult?.error;
  const hasFailed = currentCallStatus.isError || resultError;
  const isVisible = enabled;
  const isDownsampled = calculationResult?.isDownsampled;

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
      <td
        style={{ textAlign: 'center', paddingLeft: 0 }}
        className="downloadChartHide"
      >
        <DropdownWithoutMaxWidth
          disabled={!enabled}
          content={
            <AppearanceDropdown
              selectedColor={color}
              selectedLineStyle={lineStyle}
              selectedLineWeight={lineWeight}
              selectedInterpolation={interpolation}
              onUpdate={handleUpdateAppearance}
              translations={
                useTranslations(
                  AppearanceDropdown.translationKeys,
                  'AppearanceDropdown'
                ).t
              }
            />
          }
        >
          <StyleButton
            disabled={!enabled}
            styleType="Function"
            styleColor={color}
            label="Workflow Function"
          />
        </DropdownWithoutMaxWidth>
      </td>
      <td>
        <SourceItem disabled={!enabled} key={id}>
          <SourceStatus
            onClick={handleStatusIconClick}
            onDoubleClick={(event) => event.stopPropagation()}
          >
            <StyledVisibilityIcon type={enabled ? 'EyeShow' : 'EyeHide'} />
          </SourceStatus>
          <SourceStatus>
            {call && (
              <Tooltip
                disabled={!isDownsampled}
                content="The time span for this calculation is too long. The result is based on fewer data-points and may not be accurate. Use a shorter date range for an accurate result."
                maxWidth={350}
              >
                <CalculationCallStatus
                  id={call.callId}
                  query={resultQuery}
                  renderLoading={() => (
                    <StyledStatusIcon
                      type={getIconTypeFromStatus(StatusStatusEnum.Running)}
                      style={{
                        color: isDownsampled ? 'var(--cogs-yellow-1)' : 'auto',
                      }}
                    />
                  )}
                  renderStatus={({ status }) => (
                    <StyledStatusIcon
                      type={
                        isDownsampled
                          ? 'WarningFilled'
                          : getIconTypeFromStatus(status)
                      }
                      style={{
                        color: isDownsampled ? 'var(--cogs-yellow-1)' : '#000',
                      }}
                    />
                  )}
                />
              </Tooltip>
            )}
          </SourceStatus>
          {hasFailed && (
            <Tooltip content={resultError} maxWidth={300}>
              <StyledErrorIcon type="Error" />
            </Tooltip>
          )}
          <SourceName>
            <TranslatedEditableText
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
            <SourceItem disabled={!enabled}>
              <SourceName>
                <SourceDescription>
                  <Tooltip content={name || 'noname'} maxWidth={350}>
                    <>{name || 'noname'}</>
                  </Tooltip>
                </SourceDescription>
              </SourceName>
            </SourceItem>
          </td>
          <td className="bordered">
            <SourceItem disabled={!isVisible}>
              {formatValueForDisplay(convertUnit(summary?.min))}
            </SourceItem>
          </td>
          <td className="bordered">
            <SourceItem disabled={!isVisible}>
              {formatValueForDisplay(convertUnit(summary?.max))}
            </SourceItem>
          </td>
          <td className="bordered">
            <SourceItem disabled={!isVisible}>
              {formatValueForDisplay(convertUnit(summary?.mean))}
            </SourceItem>
          </td>
          <td className="col-unit">
            <UnitDropdown
              unit={unit}
              preferredUnit={preferredUnit}
              customUnitLabel={customUnitLabel}
              onOverrideUnitClick={updateUnit}
              onConversionUnitClick={updatePrefferedUnit}
              onResetUnitClick={resetUnit}
              onCustomUnitLabelClick={updateCustomUnitLabel}
              translations={unitDropdownTranslations}
            />
          </td>
          <td className="downloadChartHide col-action" />
          <td
            style={{ textAlign: 'center', paddingLeft: 0 }}
            className="downloadChartHide col-action"
          >
            <Popconfirm
              onConfirm={remove}
              okText={t.Remove}
              cancelText={t.Cancel}
              content={
                <div style={{ textAlign: 'left' }}>
                  {t['Remove this calculation?']}
                </div>
              }
            >
              <Button
                type="ghost"
                icon="Delete"
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
            <Dropdown.Uncontrolled
              options={[
                {
                  label: t['Edit calculation'],
                  icon: 'Function',
                  onClick: openNodeEditor,
                },
                {
                  label: t.Duplicate,
                  icon: 'Duplicate',
                  onClick: () => {
                    const wf = chart?.workflowCollection?.find(
                      (wfc) => wfc.id === id
                    );
                    if (wf) {
                      setChart((oldChart) => duplicateWorkflow(oldChart!, id));
                      trackUsage('ChartView.DuplicateCalculation');
                    }
                  },
                },
                {
                  label: t.Threshold,
                  icon: 'Threshold',
                  onClick: () => {
                    onThresholdClick(id);
                  },
                },
              ]}
            />
          </td>
        </>
      )}
    </SourceRow>
  );
}

WorkflowRow.translationKeys = Object.keys(defaultTranslations);

export default WorkflowRow;
