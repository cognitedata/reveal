import React, { useCallback, useState } from 'react';

import styled from 'styled-components';

import dayjs from 'dayjs';

import { createLink } from '@cognite/cdf-utilities';
import { Button, Pagination, ToolBar, Tooltip } from '@cognite/cogs.js';
import { ContainerType } from '@cognite/unified-file-viewer';

import type { OCRAnnotationPageResult } from '@data-exploration-lib/domain-layer';

import { translationKeys } from '../../common';
import DateRangePrompt from '../../components/DateRangePrompt';
import PropertySelectorToolbarWrapper from '../../components/PropertySelector/PropertySelectorToolbarWrapper';
import { Property } from '../../components/PropertySelector/types';
import { MetricEvent } from '../../constants';
import {
  openResourceSelector,
  setFilteredPropertiesByContainerConfigs,
} from '../../state/useIndustrialCanvasStore';
import {
  IndustryCanvasContainerConfig,
  isIndustryCanvasTimeSeriesContainer,
} from '../../types';
import assertNever from '../../utils/assertNever';
import getDefaultContainerLabel from '../../utils/getDefaultContainerLabel';
import useMetrics from '../../utils/tracking/useMetrics';
import {
  OnUpdateTooltipsOptions,
  TooltipsOptions,
} from '../useTooltipsOptions';
import { useTranslation } from '../useTranslation';

import getContainerText from './getContainerText';
import LabelToolbar from './LabelToolbar';

const TooltipToolBarContainer = styled.div`
  margin: 18px 0px;
`;

const navigateToPath = (path: string, query?: any) => {
  const link = createLink(path, query);
  window.open(link, '_blank');
};

type ContainerTooltipProps = {
  selectedContainer: IndustryCanvasContainerConfig;
  containers: IndustryCanvasContainerConfig[];
  tooltipsOptions: TooltipsOptions;
  onUpdateTooltipsOptions: OnUpdateTooltipsOptions;
  onUpdateContainer: (containerConfig: IndustryCanvasContainerConfig) => void;
  onRemoveContainer: () => void;
  onAddSummarizationSticky: (
    container: IndustryCanvasContainerConfig,
    text: string,
    isMultiPageDocument: boolean
  ) => void;
  shamefulNumPages: number | undefined;
  isOcrDataLoading: boolean;
  ocrData: OCRAnnotationPageResult[] | undefined;
  isLoadingSummary: boolean;
  setIsLoadingSummary: (isLoading: boolean) => void;
};

const ContainerTooltip: React.FC<ContainerTooltipProps> = ({
  selectedContainer,
  containers,
  onUpdateContainer,
  onRemoveContainer,
  onAddSummarizationSticky,
  tooltipsOptions,
  onUpdateTooltipsOptions,
  shamefulNumPages,
  isOcrDataLoading,
  ocrData,
  isLoadingSummary,
  setIsLoadingSummary,
}) => {
  const trackUsage = useMetrics();
  const [isInEditLabelMode, setIsInEditLabelMode] = useState(false);
  const [isChangingProperties, setIsChangingProperties] = useState(false);
  const { resourceType, resourceId } = selectedContainer.metadata;
  const { t } = useTranslation();

  const onSaveLabel = useCallback(
    (label: string) => {
      if (selectedContainer === undefined) {
        return;
      }

      onUpdateContainer({
        ...selectedContainer,
        label: label.trim() || getDefaultContainerLabel(selectedContainer),
      });
      setIsInEditLabelMode(false);
      trackUsage(MetricEvent.CONTAINER_LABEL_CHANGED, {
        containerType: selectedContainer.type,
        labelLength: label.length,
      });
    },
    [selectedContainer, onUpdateContainer, trackUsage]
  );

  const resourceSelectorOpenHandler = useCallback(
    (container: IndustryCanvasContainerConfig) => {
      if (container.type === ContainerType.REVEAL) {
        // Reveal containers are not supported in the resource selector yet.
        return null;
      }

      // TODO: This should never happen, but our types are not strict enough.
      if (resourceType === undefined || resourceId === undefined) {
        return;
      }
      if (
        container.type === ContainerType.ASSET ||
        container.type === ContainerType.EVENT ||
        container.type === ContainerType.TIMESERIES ||
        container.type === ContainerType.DOCUMENT ||
        container.type === ContainerType.IMAGE ||
        container.type === ContainerType.TEXT
      ) {
        openResourceSelector({
          initialSelectedResourceItem: {
            type: resourceType,
            id: resourceId,
          },
          initialFilter: {
            common: {
              internalId: resourceId,
            },
          },
          shouldOnlyShowPreviewPane: true,
        });
        return;
      }

      if (
        container.type === ContainerType.FDM_INSTANCE ||
        container.type === ContainerType.ROW ||
        container.type === ContainerType.COLUMN ||
        container.type === ContainerType.FLEXIBLE_LAYOUT ||
        container.type === ContainerType.TABLE
      ) {
        throw new Error(
          'Find related data not implemented for container type: ' +
            container.type
        );
      }

      assertNever(container);
    },
    [resourceId, resourceType]
  );

  const onOpenInResourceSelectorClick = useCallback(() => {
    resourceSelectorOpenHandler(selectedContainer);
    trackUsage(MetricEvent.CONTAINER_OPEN_IN_RESOURCE_SELECTOR_CLICKED, {
      containerType: selectedContainer.type,
      resourceType: selectedContainer.metadata.resourceType,
    });
  }, [resourceSelectorOpenHandler, selectedContainer, trackUsage]);

  const onClose = useCallback(() => {
    setIsInEditLabelMode(false);
  }, []);

  if (
    selectedContainer.type === ContainerType.ASSET ||
    selectedContainer.type === ContainerType.EVENT
  ) {
    const handleApplyClick = ({
      properties,
      shouldApplyToAll,
    }: {
      properties: Property[];
      shouldApplyToAll: boolean;
    }) => {
      setFilteredPropertiesByContainerConfigs({
        containerConfigs: [selectedContainer],
        propertyPaths: properties.map((property) => property.path),
        shouldApplyToAll,
      });
      setIsChangingProperties(false);
    };

    return (
      <TooltipToolBarContainer>
        {isInEditLabelMode && (
          <LabelToolbar
            onClose={onClose}
            onSave={onSaveLabel}
            initialValue={selectedContainer.label}
          />
        )}
        {isChangingProperties && (
          <PropertySelectorToolbarWrapper
            containerConfig={selectedContainer}
            onApplyClick={handleApplyClick}
          />
        )}
        <ToolBar direction="horizontal">
          <>
            <Tooltip
              content={t(translationKeys.CHANGE_LABEL_TOOLTIP, 'Change label')}
            >
              <Button
                icon="String"
                onClick={() => setIsInEditLabelMode((prevState) => !prevState)}
                type="ghost"
                aria-label={t(
                  translationKeys.CHANGE_LABEL_TOOLTIP,
                  'Change label'
                )}
              />
            </Tooltip>
            <Tooltip
              content={t(
                translationKeys.TOOLTIP_CHANGE_FIELDS,
                'Change fields'
              )}
            >
              <Button
                icon="ListAdd"
                onClick={() =>
                  setIsChangingProperties((prevState) => !prevState)
                }
                type="ghost"
                aria-label={t(
                  translationKeys.TOOLTIP_CHANGE_FIELDS,
                  'Change field'
                )}
              />
            </Tooltip>
            <Tooltip
              content={t(
                translationKeys.FIND_RELATED_DATA,
                'Find related data'
              )}
            >
              <Button
                icon="ListSearch"
                onClick={onOpenInResourceSelectorClick}
                type="ghost"
                aria-label={t(
                  translationKeys.FIND_RELATED_DATA,
                  'Find related data'
                )}
              />
            </Tooltip>
            <Tooltip
              content={t(
                translationKeys.OPEN_IN_DATA_EXPLORER,
                'Open in Data Explorer'
              )}
            >
              <Button
                icon="ExternalLink"
                onClick={() => {
                  navigateToPath(
                    `/explore/${selectedContainer.metadata.resourceType}/${selectedContainer.metadata.resourceId}`
                  );
                  trackUsage(
                    MetricEvent.CONTAINER_OPEN_IN_DATA_EXPLORER_CLICKED,
                    {
                      containerType: selectedContainer.type,
                      resourceType: selectedContainer.metadata.resourceType,
                    }
                  );
                }}
                type="ghost"
                aria-label={t(
                  translationKeys.OPEN_IN_DATA_EXPLORER,
                  'Open in Data Explorer'
                )}
              />
            </Tooltip>
          </>
          <Tooltip content={t(translationKeys.REMOVE, 'Remove')}>
            <Button
              icon="Delete"
              onClick={onRemoveContainer}
              type="ghost"
              aria-label={`Remove ${selectedContainer.metadata.resourceType}`}
            />
          </Tooltip>
        </ToolBar>
      </TooltipToolBarContainer>
    );
  }

  if (selectedContainer.type === ContainerType.TIMESERIES) {
    return (
      <TooltipToolBarContainer>
        {isInEditLabelMode && (
          <LabelToolbar
            onClose={onClose}
            onSave={onSaveLabel}
            initialValue={selectedContainer.label}
          />
        )}
        <ToolBar direction="horizontal">
          <>
            <Tooltip
              content={t(
                translationKeys.TIMESERIES_TOOLTIP_LAST_DAY,
                'Last day'
              )}
            >
              <Button
                type="ghost"
                size="medium"
                onClick={() =>
                  onUpdateContainer({
                    ...selectedContainer,
                    startDate: dayjs()
                      .subtract(1, 'day')
                      .startOf('day')
                      .toDate(),
                    endDate: dayjs().endOf('day').toDate(),
                  })
                }
                aria-label={t(
                  translationKeys.TIMESERIES_TOOLTIP_LAST_DAY,
                  'Last day'
                )}
              >
                1d
              </Button>
            </Tooltip>

            <Tooltip
              content={t(
                translationKeys.TIMESERIES_TOOLTIP_LAST_MONTH,
                'Last month'
              )}
            >
              <Button
                onClick={() =>
                  onUpdateContainer({
                    ...selectedContainer,
                    startDate: dayjs()
                      .subtract(1, 'month')
                      .startOf('day')
                      .toDate(),
                    endDate: dayjs().endOf('day').toDate(),
                  })
                }
                type="ghost"
                size="medium"
                aria-label={t(
                  translationKeys.TIMESERIES_TOOLTIP_LAST_YEAR,
                  'Last month'
                )}
              >
                1m
              </Button>
            </Tooltip>

            <Tooltip
              content={t(
                translationKeys.TIMESERIES_TOOLTIP_LAST_YEAR,
                'Last year'
              )}
            >
              <Button
                onClick={() =>
                  onUpdateContainer({
                    ...selectedContainer,
                    startDate: dayjs()
                      .subtract(1, 'year')
                      .startOf('day')
                      .toDate(),
                    endDate: dayjs().endOf('day').toDate(),
                  })
                }
                type="ghost"
                size="medium"
                aria-label={t(
                  translationKeys.TIMESERIES_TOOLTIP_LAST_YEAR,
                  'Last year'
                )}
              >
                1y
              </Button>
            </Tooltip>

            <DateRangePrompt
              // The date range can change from interacting inside of the TimeseriesContainer,
              // this is a workaround to make sure the date range prompt shows rerenders to
              // show the correct thing when the date range changes.
              key={`${selectedContainer.startDate}_${selectedContainer.endDate}`}
              initialRange={{
                startDate: selectedContainer.startDate,
                endDate: selectedContainer.endDate,
              }}
              shouldApplyToAllTimeSeries={
                tooltipsOptions[ContainerType.TIMESERIES].shouldApplyToAll
              }
              onToggleShouldApplyToAllTimeSeries={() => {
                const nextShouldApplyToAll =
                  !tooltipsOptions[ContainerType.TIMESERIES].shouldApplyToAll;

                onUpdateTooltipsOptions(ContainerType.TIMESERIES, {
                  shouldApplyToAll: nextShouldApplyToAll,
                });

                trackUsage(MetricEvent.TIMESERIES_APPLY_TO_ALL_TOGGLED, {
                  newValue: nextShouldApplyToAll,
                });
              }}
              onComplete={(dateRange, shouldApplyToAllTimeSeries) => {
                const containersToUpdate = (
                  shouldApplyToAllTimeSeries ? containers : [selectedContainer]
                ).filter(isIndustryCanvasTimeSeriesContainer);

                const startDate = dayjs(dateRange.startDate)
                  .startOf('day')
                  .toDate();

                const endDate = dayjs(dateRange.endDate).endOf('day').toDate();

                onUpdateTooltipsOptions(ContainerType.TIMESERIES, {
                  shouldApplyToAll: shouldApplyToAllTimeSeries,
                  startDate,
                  endDate,
                });

                containersToUpdate.forEach((container) => {
                  onUpdateContainer({
                    ...container,
                    startDate,
                    endDate,
                  });
                });

                trackUsage(MetricEvent.TIMESERIES_DATE_RANGE_CHANGED, {
                  startDate: dateRange.startDate,
                  endDate: dateRange.endDate,
                  appliedToAll: shouldApplyToAllTimeSeries,
                });
              }}
            />
          </>
          <>
            <Tooltip
              content={t(translationKeys.CHANGE_LABEL_TOOLTIP, 'Change label')}
            >
              <Button
                icon="String"
                onClick={() => setIsInEditLabelMode((prevState) => !prevState)}
                type="ghost"
                aria-label={t(
                  translationKeys.CHANGE_LABEL_TOOLTIP,
                  'Change label'
                )}
              />
            </Tooltip>
            <Tooltip
              content={t(translationKeys.OPEN_IN_CHARTS, 'Open in Charts')}
            >
              <Button
                icon="LineChart"
                onClick={() => {
                  navigateToPath('/charts', {
                    timeserieIds: [selectedContainer.metadata.resourceId],
                    startTime: selectedContainer.startDate.getTime(),
                    endTime: selectedContainer.endDate.getTime(),
                  });
                  trackUsage(
                    MetricEvent.CONTAINER_OPEN_IN_DATA_EXPLORER_CLICKED,
                    {
                      containerType: selectedContainer.type,
                    }
                  );
                }}
                type="ghost"
                aria-label={t(translationKeys.OPEN_IN_CHARTS, 'Open in Charts')}
              />
            </Tooltip>
            <Tooltip
              content={t(
                translationKeys.FIND_RELATED_DATA,
                'Find related data'
              )}
            >
              <Button
                icon="ListSearch"
                onClick={onOpenInResourceSelectorClick}
                type="ghost"
                aria-label={t(
                  translationKeys.FIND_RELATED_DATA,
                  'Find related data'
                )}
              />
            </Tooltip>
            <Tooltip
              content={t(
                translationKeys.OPEN_IN_DATA_EXPLORER,
                'Open in Data Explorer'
              )}
            >
              <Button
                icon="ExternalLink"
                onClick={() => {
                  navigateToPath(
                    `/explore/timeSeries/${selectedContainer.metadata.resourceId}`
                  );
                  trackUsage(
                    MetricEvent.CONTAINER_OPEN_IN_DATA_EXPLORER_CLICKED,
                    {
                      containerType: selectedContainer.type,
                    }
                  );
                }}
                type="ghost"
                aria-label={t(
                  translationKeys.OPEN_IN_DATA_EXPLORER,
                  'Open in Data Explorer'
                )}
              />
            </Tooltip>
          </>
          <Tooltip content={t(translationKeys.REMOVE, 'Remove')}>
            <Button
              icon="Delete"
              onClick={onRemoveContainer}
              type="ghost"
              aria-label={t(
                translationKeys.REMOVE_TIMESERIES_TOOLTIP,
                'Remove time series'
              )}
            />
          </Tooltip>
        </ToolBar>
      </TooltipToolBarContainer>
    );
  }

  if (selectedContainer.type === ContainerType.REVEAL) {
    return (
      <TooltipToolBarContainer>
        {isInEditLabelMode && (
          <LabelToolbar
            onClose={onClose}
            onSave={onSaveLabel}
            initialValue={selectedContainer.label}
          />
        )}
        <ToolBar direction="horizontal">
          <>
            <Tooltip
              content={t(translationKeys.CHANGE_LABEL_TOOLTIP, 'Change label')}
            >
              <Button
                icon="String"
                onClick={() => setIsInEditLabelMode((prevState) => !prevState)}
                type="ghost"
                aria-label={t(
                  translationKeys.CHANGE_LABEL_TOOLTIP,
                  'Change label'
                )}
              />
            </Tooltip>
            <Tooltip
              content={t(
                translationKeys.OPEN_IN_DATA_EXPLORER,
                'Open in Data Explorer'
              )}
            >
              <Button
                icon="ExternalLink"
                onClick={() => {
                  navigateToPath(`/explore/threeD/${selectedContainer.id}`);
                  trackUsage(
                    MetricEvent.CONTAINER_OPEN_IN_DATA_EXPLORER_CLICKED,
                    {
                      containerType: selectedContainer.type,
                    }
                  );
                }}
                type="ghost"
                aria-label={t(
                  translationKeys.OPEN_IN_DATA_EXPLORER,
                  'Open in Data Explorer'
                )}
              />
            </Tooltip>
          </>
          <Tooltip
            content={t(translationKeys.REMOVE_CONTAINER_TOOLTIP, 'Remove')}
          >
            <Button
              icon="Delete"
              onClick={onRemoveContainer}
              type="ghost"
              aria-label={t(
                translationKeys.REMOVE_THREE_D_TOOLTIP,
                'Remove 3D-model'
              )}
            />
          </Tooltip>
        </ToolBar>
      </TooltipToolBarContainer>
    );
  }

  if (
    selectedContainer.type === ContainerType.DOCUMENT ||
    selectedContainer.type === ContainerType.IMAGE ||
    selectedContainer.type === ContainerType.TEXT
  ) {
    const ocrText = getContainerText(selectedContainer, ocrData);
    const onSummarizationClick = async () => {
      if (onAddSummarizationSticky) {
        setIsLoadingSummary(true);
        trackUsage(MetricEvent.DOCUMENT_SUMMARIZE_CLICKED, {
          ocrTextLength: ocrText.length,
        });

        await onAddSummarizationSticky(
          selectedContainer,
          ocrText,
          shamefulNumPages !== undefined && shamefulNumPages > 1
        );
        setIsLoadingSummary(false);
      }
    };
    return (
      <TooltipToolBarContainer>
        {isInEditLabelMode && (
          <LabelToolbar
            onClose={onClose}
            onSave={onSaveLabel}
            initialValue={selectedContainer.label}
          />
        )}
        <ToolBar direction="horizontal">
          <>
            <Tooltip
              content={t(translationKeys.CHANGE_LABEL_TOOLTIP, 'Change label')}
            >
              <Button
                icon="String"
                onClick={() => setIsInEditLabelMode((prevState) => !prevState)}
                type="ghost"
                aria-label={t(
                  translationKeys.CHANGE_LABEL_TOOLTIP,
                  'Change label'
                )}
              />
            </Tooltip>
            {selectedContainer.type === ContainerType.DOCUMENT &&
              shamefulNumPages !== undefined &&
              shamefulNumPages > 1 && (
                <Pagination
                  totalPages={shamefulNumPages}
                  hideItemsPerPage
                  currentPage={selectedContainer.page}
                  size="small"
                  onPageChange={(page) =>
                    onUpdateContainer({
                      ...selectedContainer,
                      page,
                    })
                  }
                />
              )}

            <Tooltip
              content={
                ocrText.length === 0
                  ? t(
                      translationKeys.CONTAINER_TOOLTIP_SUMMARIZATION_UNAVAILABLE,
                      {
                        type: selectedContainer.type,
                        defaultValue:
                          'Summarization is unavailable for this {{type}} (Experimental)',
                      }
                    )
                  : t(translationKeys.CONTAINER_TOOLTIP_SUMMARIZE, {
                      type: selectedContainer.type,
                      defaultValue: 'Summarize the {{type}} (Experimental)',
                    })
              }
            >
              <Button
                icon={
                  isOcrDataLoading || isLoadingSummary
                    ? 'Loader'
                    : 'Documentation'
                }
                disabled={isOcrDataLoading || !ocrData || ocrData.length === 0}
                onClick={onSummarizationClick}
                type="ghost"
              />
            </Tooltip>

            <Tooltip
              content={t(
                translationKeys.FIND_RELATED_DATA,
                'Find related data'
              )}
            >
              <Button
                icon="ListSearch"
                onClick={onOpenInResourceSelectorClick}
                type="ghost"
                aria-label={t(
                  translationKeys.FIND_RELATED_DATA,
                  'Find related data'
                )}
              />
            </Tooltip>
            <Tooltip
              content={t(
                translationKeys.OPEN_IN_DATA_EXPLORER,
                'Open in Data Explorer'
              )}
            >
              <Button
                icon="ExternalLink"
                onClick={() => {
                  navigateToPath(
                    `/explore/file/${selectedContainer.metadata.resourceId}`
                  );
                  trackUsage(
                    MetricEvent.CONTAINER_OPEN_IN_DATA_EXPLORER_CLICKED,
                    {
                      containerType: selectedContainer.type,
                    }
                  );
                }}
                type="ghost"
                aria-label={t(
                  translationKeys.OPEN_IN_DATA_EXPLORER,
                  'Open in Data Explorer'
                )}
              />
            </Tooltip>
          </>
          <Tooltip content={t(translationKeys.REMOVE, 'Remove')}>
            <Button
              icon="Delete"
              onClick={onRemoveContainer}
              aria-label={t(
                translationKeys.REMOVE_DOCUMENT_TOOLTIP,
                'Remove document'
              )}
              type="ghost"
            />
          </Tooltip>
        </ToolBar>
      </TooltipToolBarContainer>
    );
  }

  if (selectedContainer.type === ContainerType.FDM_INSTANCE) {
    return (
      <TooltipToolBarContainer>
        {isInEditLabelMode && (
          <LabelToolbar
            onClose={onClose}
            onSave={onSaveLabel}
            initialValue={selectedContainer.label}
          />
        )}
        <ToolBar direction="horizontal">
          <>
            <Tooltip
              content={t(translationKeys.CHANGE_LABEL_TOOLTIP, 'Change label')}
            >
              <Button
                icon="String"
                onClick={() => setIsInEditLabelMode((prevState) => !prevState)}
                type="ghost"
                aria-label={t(
                  translationKeys.CHANGE_LABEL_TOOLTIP,
                  'Change label'
                )}
              />
            </Tooltip>
            {/* TODO: add support for opening the clicked container in FDX? */}
          </>
          <Tooltip content={t(translationKeys.REMOVE, 'Remove')}>
            <Button
              icon="Delete"
              onClick={onRemoveContainer}
              type="ghost"
              aria-label={`Remove ${selectedContainer.metadata.resourceType}`}
            />
          </Tooltip>
        </ToolBar>
      </TooltipToolBarContainer>
    );
  }

  return null;
};

export default ContainerTooltip;
