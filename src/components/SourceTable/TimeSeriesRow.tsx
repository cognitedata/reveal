import { ComponentProps, useState } from 'react';
import { ChartTimeSeries } from 'models/chart/types';
import { Button, Tooltip, Popconfirm } from '@cognite/cogs.js';
import { useLinkedAsset } from 'hooks/cdf-assets';
import AppearanceDropdown from 'components/AppearanceDropdown/AppearanceDropdown';
import { PnidButton } from 'components/SearchResultTable/PnidButton';
import UnitDropdown from 'components/UnitDropdown/UnitDropdown';
import { trackUsage } from 'services/metrics';
import { formatValueForDisplay } from 'utils/numbers';
import { DatapointsSummary } from 'utils/units';
import { DraggableProvided } from 'react-beautiful-dnd';
import { StyleButton } from 'components/StyleButton/StyleButton';
import { useComponentTranslations, useTranslations } from 'hooks/translations';
import { makeDefaultTranslations } from 'utils/translations';
import TranslatedEditableText from 'components/EditableText/TranslatedEditableText';
import Dropdown from 'components/Dropdown/Dropdown';
import { TimeseriesEntry } from 'models/timeseries-results/types';
import {
  SourceItem,
  SourceName,
  SourceRow,
  SourceDescription,
  SourceTag,
  SourceStatus,
  DropdownWithoutMaxWidth,
  StyledVisibilityIcon,
} from './elements';

type Props = {
  timeseries: ChartTimeSeries;
  summary?: DatapointsSummary;
  disabled?: boolean;
  isSelected?: boolean;
  onRowClick?: (id?: string) => void;
  onInfoClick?: (id?: string) => void;
  onThresholdClick?: (id?: string) => void;
  isWorkspaceMode?: boolean;
  isFileViewerMode?: boolean;
  provided?: DraggableProvided | undefined;
  draggable?: boolean;
  translations: typeof defaultTranslations;
  timeseriesResult?: TimeseriesEntry;
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
  onUpdateAppearance?: (diff: Partial<ChartTimeSeries>) => void;
  onUpdateName?: (value: string) => void;
};

/**
 * Timeseries translations
 */
const defaultTranslations = makeDefaultTranslations(
  'Remove',
  'Cancel',
  'Remove this time series?',
  'Threshold'
);

function TimeSeriesRow({
  timeseries,
  summary,
  onRowClick = () => {},
  onInfoClick = () => {},
  onThresholdClick = () => {},
  disabled = false,
  isSelected = false,
  isWorkspaceMode = false,
  isFileViewerMode = false,
  draggable = false,
  provided = undefined,
  translations,
  onOverrideUnitClick = () => {},
  onConversionUnitClick = () => {},
  onResetUnitClick = () => {},
  onCustomUnitLabelClick = () => {},
  onStatusIconClick = () => {},
  onRemoveSourceClick = () => {},
  onUpdateAppearance = () => {},
  onUpdateName = () => {},
}: Props) {
  const {
    id,
    description,
    name,
    unit,
    color = '',
    lineStyle = 'none',
    lineWeight = 1,
    interpolation = 'linear',
    preferredUnit,
    originalUnit,
    customUnitLabel,
    enabled,
    tsExternalId,
  } = timeseries;
  const [isEditingName, setIsEditingName] = useState<boolean>(false);

  /**
   * Translations
   */
  const t = { ...defaultTranslations, ...translations };
  /**
   * Unit Dropdown translations
   */
  const unitDropdownTranslations = useComponentTranslations(UnitDropdown);
  /**
   * Apperance Dropdown translations
   */
  const { t: appearanceDropdownTranslations } = useTranslations(
    AppearanceDropdown.translationKeys,
    'AppearanceDropdown'
  );

  const { data: linkedAsset } = useLinkedAsset(tsExternalId, true);

  const isVisible = enabled || isFileViewerMode;

  return (
    <SourceRow
      aria-hidden={!isVisible}
      aria-selected={isSelected}
      key={id}
      onClick={() => !disabled && onRowClick(id)}
      ref={draggable ? provided?.innerRef : null}
      {...provided?.draggableProps}
      {...provided?.dragHandleProps}
    >
      <td
        style={{ textAlign: 'center', paddingLeft: 0 }}
        className="downloadChartHide"
      >
        <DropdownWithoutMaxWidth
          disabled={!isVisible}
          content={
            <AppearanceDropdown
              selectedColor={color}
              selectedLineStyle={lineStyle}
              selectedLineWeight={lineWeight}
              selectedInterpolation={interpolation}
              onUpdate={onUpdateAppearance}
              translations={appearanceDropdownTranslations}
            />
          }
        >
          <StyleButton
            disabled={!isVisible}
            styleType="Timeseries"
            styleColor={color}
            label="Timeseries"
          />
        </DropdownWithoutMaxWidth>
      </td>
      <td>
        <SourceItem disabled={!isVisible} key={id}>
          {!isFileViewerMode && (
            <SourceStatus
              onClick={(event) => {
                event.stopPropagation();
                onStatusIconClick();
              }}
            >
              <StyledVisibilityIcon
                type={isVisible ? 'EyeShow' : 'EyeHide'}
                title="Toggle visibility"
              />
            </SourceStatus>
          )}
          <SourceName title={name}>
            {!isFileViewerMode && (
              <TranslatedEditableText
                value={name || 'noname'}
                onChange={(value) => {
                  onUpdateName(value);
                  trackUsage('ChartView.RenameTimeSeries');
                  setIsEditingName(false);
                }}
                onCancel={() => setIsEditingName(false)}
                editing={isEditingName}
                hideButtons
              />
            )}
            {isFileViewerMode && name}
          </SourceName>
        </SourceItem>
      </td>
      {(isWorkspaceMode || isFileViewerMode) && (
        <>
          <td className="bordered">
            <SourceItem disabled={!isVisible}>
              <SourceTag>{linkedAsset?.name}</SourceTag>
            </SourceItem>
          </td>
          <td className="bordered">
            <SourceItem disabled={!isVisible}>
              <SourceDescription>
                <Tooltip content={description} maxWidth={350}>
                  <>{description}</>
                </Tooltip>
              </SourceDescription>
            </SourceItem>
          </td>
        </>
      )}
      {isWorkspaceMode && (
        <>
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
              originalUnit={originalUnit}
              preferredUnit={preferredUnit}
              customUnitLabel={customUnitLabel}
              onOverrideUnitClick={onOverrideUnitClick}
              onConversionUnitClick={onConversionUnitClick}
              onCustomUnitLabelClick={onCustomUnitLabelClick}
              onResetUnitClick={onResetUnitClick}
              translations={unitDropdownTranslations}
            />
          </td>
        </>
      )}
      {(isWorkspaceMode || isFileViewerMode) && (
        <td
          style={{ textAlign: 'center', paddingLeft: 0 }}
          className="downloadChartHide col-action"
        >
          <PnidButton
            timeseriesExternalId={tsExternalId}
            hideWhenEmpty={false}
          />
        </td>
      )}
      {(isWorkspaceMode || isFileViewerMode) && (
        <td
          style={{ textAlign: 'center', paddingLeft: 0 }}
          className="downloadChartHide col-action"
        >
          <Popconfirm
            onConfirm={onRemoveSourceClick}
            okText={translations.Remove}
            cancelText={translations.Cancel}
            content={
              <div style={{ textAlign: 'left' }}>
                {translations['Remove this time series?']}
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
      )}
      {isWorkspaceMode && (
        <>
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

TimeSeriesRow.translationKeys = Object.keys(defaultTranslations);

export default TimeSeriesRow;
