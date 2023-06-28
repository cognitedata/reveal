import { ComponentProps, useState } from 'react';
import { DraggableProvided } from 'react-beautiful-dnd';

import AppearanceDropdown from '@charts-app/components/AppearanceDropdown/AppearanceDropdown';
import { StyleButton } from '@charts-app/components/StyleButton/StyleButton';
import UnitDropdown from '@charts-app/components/UnitDropdown/UnitDropdown';
import { useScheduledCalculationDeleteMutate } from '@charts-app/domain/scheduled-calculation/service/queries/useScheduledCalculationDeleteMutate';
import {
  useComponentTranslations,
  useTranslations,
} from '@charts-app/hooks/translations';
import {
  ChartWorkflow,
  ScheduledCalculation,
} from '@charts-app/models/chart/types';
import { ScheduledCalculationData } from '@charts-app/models/scheduled-calculation-results/types';
import { formatValueForDisplay } from '@charts-app/utils/numbers';
import {
  makeDefaultTranslations,
  translationKeys,
} from '@charts-app/utils/translations';
import { DatapointsSummary } from '@charts-app/utils/units';

import { Button, toast, Tooltip } from '@cognite/cogs.js';

import { useTimeseriesDeleteMutate } from '../../domain/scheduled-calculation/service/queries/useTimeseriesDeleteMutate';
import { ScheduledCalculationDeleteModal } from '../ScheduledCalculation/ScheduledCalculationDeleteModal';

import {
  DropdownWithoutMaxWidth,
  SourceDescription,
  SourceItem,
  SourceName,
  SourceRow,
  SourceStatus,
  StyledVisibilityIcon,
} from './elements';

type Props = {
  scheduledCalculation: ScheduledCalculation;
  summary?: DatapointsSummary;
  isSelected?: boolean;
  onRowClick?: (id?: string) => void;
  onInfoClick?: (id?: string) => void;
  onErrorIconClick?: (id: string) => void;
  openNodeEditor?: () => void;
  mode: string;
  draggable?: boolean;
  provided?: DraggableProvided | undefined;
  translations: typeof defaultTranslations;
  scheduledCalculationResult?: ScheduledCalculationData;
  onOverrideUnitClick?: ComponentProps<
    typeof UnitDropdown
  >['onOverrideUnitClick'];
  onConversionUnitClick?: ComponentProps<
    typeof UnitDropdown
  >['onConversionUnitClick'];
  onResetUnitClick?: ComponentProps<typeof UnitDropdown>['onResetUnitClick'];
  onCustomUnitLabelClick?: ComponentProps<
    typeof UnitDropdown
  >['onCustomUnitLabelClick'];
  onStatusIconClick?: () => void;
  onRemoveSourceClick?: () => void;
  onUpdateAppearance?: (diff: Partial<ChartWorkflow>) => void;
};

/**
 * Scheduled Calculation translations
 */
const defaultTranslations = makeDefaultTranslations(
  'Remove',
  'Cancel',
  'Remove this scheduled calculation?',
  'Unable to delete scheduled calculation.',
  'Deleted scheduled calculation successfully.'
);

export const ScheduledCalculationRow = ({
  scheduledCalculation,
  summary,
  onRowClick = () => {},
  onInfoClick = () => {},
  mode,
  openNodeEditor = () => {},
  isSelected = false,
  draggable = false,
  provided = undefined,
  translations,
  scheduledCalculationResult,
  onOverrideUnitClick = () => {},
  onConversionUnitClick = () => {},
  onResetUnitClick = () => {},
  onCustomUnitLabelClick = () => {},
  onStatusIconClick = () => {},
  onRemoveSourceClick = () => {},
  onUpdateAppearance = () => {},
}: Props) => {
  const {
    id,
    enabled,
    color = '',
    lineStyle = 'solid',
    lineWeight = 1,
    interpolation = 'linear',
    unit,
    preferredUnit,
    customUnitLabel,
  } = scheduledCalculation;
  const isWorkspaceMode = mode === 'workspace';
  const t = { ...defaultTranslations, ...translations };
  const { mutateAsync: deleteScheduledCalculation } =
    useScheduledCalculationDeleteMutate();
  const { mutateAsync: deleteTimeseries } = useTimeseriesDeleteMutate();
  const [deleteModalOpen, setDeleteModalOpen] = useState(false);

  /**
   * Unit Dropdown translations
   */
  const unitDropdownTranslations = useComponentTranslations(UnitDropdown);

  const handleRemoveSource = async (shouldDeleteTimeseries: boolean) => {
    try {
      if (scheduledCalculationResult?.externalId) {
        await deleteScheduledCalculation([
          { externalId: scheduledCalculationResult?.externalId },
        ]);
      }
      if (
        shouldDeleteTimeseries &&
        scheduledCalculationResult?.targetTimeseriesExternalId
      ) {
        await deleteTimeseries([
          {
            externalId: scheduledCalculationResult?.targetTimeseriesExternalId,
          },
        ]);
      }
      onRemoveSourceClick();
      toast.success(t['Deleted scheduled calculation successfully.']);
    } catch (e) {
      toast.error(t['Unable to delete scheduled calculation.']);
    }
  };

  const isVisible = enabled;

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
              onUpdate={onUpdateAppearance}
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
            icon="Clock"
            styleColor={color}
            label="Workflow Function"
          />
        </DropdownWithoutMaxWidth>
      </td>
      <td>
        <SourceItem disabled={!enabled} key={id}>
          <SourceStatus
            onClick={(event) => {
              event.stopPropagation();
              onStatusIconClick();
            }}
            onDoubleClick={(event) => event.stopPropagation()}
          >
            <StyledVisibilityIcon type={enabled ? 'EyeShow' : 'EyeHide'} />
          </SourceStatus>
          <SourceName>
            {scheduledCalculationResult?.name || scheduledCalculation.name}
          </SourceName>
        </SourceItem>
      </td>
      {isWorkspaceMode && (
        <>
          <td className="bordered" />
          <td className="bordered" />
          <td className="bordered">
            <SourceItem disabled={!enabled}>
              <SourceName>
                <SourceDescription>
                  <Tooltip
                    content={
                      scheduledCalculationResult?.description ||
                      scheduledCalculation.description ||
                      '-'
                    }
                    maxWidth={350}
                  >
                    <>
                      {scheduledCalculationResult?.description ||
                        scheduledCalculation.description ||
                        '-'}
                    </>
                  </Tooltip>
                </SourceDescription>
              </SourceName>
            </SourceItem>
          </td>
          <td className="bordered">
            <SourceItem disabled={!isVisible}>
              {formatValueForDisplay(summary?.min)}
            </SourceItem>
          </td>
          <td className="bordered">
            <SourceItem disabled={!isVisible}>
              {formatValueForDisplay(summary?.max)}
            </SourceItem>
          </td>
          <td className="bordered">
            <SourceItem disabled={!isVisible}>
              {formatValueForDisplay(summary?.mean)}
            </SourceItem>
          </td>
          <td className="col-unit">
            <UnitDropdown
              unit={unit}
              preferredUnit={preferredUnit}
              customUnitLabel={customUnitLabel}
              originalUnit={scheduledCalculationResult?.series?.unit}
              onOverrideUnitClick={onOverrideUnitClick}
              onConversionUnitClick={onConversionUnitClick}
              onResetUnitClick={onResetUnitClick}
              onCustomUnitLabelClick={onCustomUnitLabelClick}
              translations={unitDropdownTranslations}
            />
          </td>
          <td className="downloadChartHide col-action" />
          <td
            style={{ textAlign: 'center', paddingLeft: 0 }}
            className="downloadChartHide col-action"
          >
            <Button
              type="ghost"
              icon="Delete"
              style={{ height: 28 }}
              aria-label="delete"
              onClick={() => setDeleteModalOpen(true)}
            />
            {deleteModalOpen && (
              <ScheduledCalculationDeleteModal
                name={
                  scheduledCalculationResult?.name || scheduledCalculation.name
                }
                onOk={handleRemoveSource}
                onCancel={() => setDeleteModalOpen(false)}
              />
            )}
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
          />
        </>
      )}
    </SourceRow>
  );
};

ScheduledCalculationRow.translationKeys = translationKeys(defaultTranslations);
ScheduledCalculationRow.defaultTranslations = defaultTranslations;
ScheduledCalculationRow.translationNamespace = 'ScheduledCalculationRow';
