import React, { useCallback, useState } from 'react';

import styled from 'styled-components';

import dayjs from 'dayjs';

import { createLink } from '@cognite/cdf-utilities';
import { Button, Pagination, ToolBar, Tooltip } from '@cognite/cogs.js';
import { ContainerType } from '@cognite/unified-file-viewer';

import type { OCRAnnotationPageResult } from '@data-exploration-lib/domain-layer';

import DateRangePrompt from '../../components/DateRangePrompt';
import { MetricEvent } from '../../constants';
import {
  IndustryCanvasContainerConfig,
  isIndustryCanvasTimeSeriesContainer,
} from '../../types';
import getDefaultContainerLabel from '../../utils/getDefaultContainerLabel';
import useMetrics from '../../utils/tracking/useMetrics';
import {
  OnUpdateTooltipsOptions,
  TooltipsOptions,
} from '../useTooltipsOptions';

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

  const onClose = useCallback(() => {
    setIsInEditLabelMode(false);
  }, []);

  if (selectedContainer.type === ContainerType.TABLE) {
    if (selectedContainer.metadata.resourceType === undefined) {
      throw new Error('resourceType is undefined');
    }
    if (
      selectedContainer.metadata.resourceType !== 'asset' &&
      selectedContainer.metadata.resourceType !== 'event'
    ) {
      throw new Error('resourceType must be one of event and asset');
    }

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
            <Tooltip content="Change label">
              <Button
                icon="String"
                onClick={() => setIsInEditLabelMode((prevState) => !prevState)}
                type="ghost"
                aria-label="Change label"
              />
            </Tooltip>
            <Tooltip content="Open in Data Explorer">
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
                aria-label="Open in Data Explorer"
              />
            </Tooltip>
          </>
          <Tooltip content="Remove">
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
            <Tooltip content="Last day">
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
                aria-label="Last day"
              >
                1d
              </Button>
            </Tooltip>

            <Tooltip content="Last month">
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
                aria-label="Last month"
              >
                1m
              </Button>
            </Tooltip>

            <Tooltip content="Last year">
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
                aria-label="Last year"
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

                containersToUpdate.forEach((container) => {
                  onUpdateContainer({
                    ...container,
                    startDate: dayjs(dateRange.startDate)
                      .startOf('day')
                      .toDate(),
                    endDate: dayjs(dateRange.endDate).endOf('day').toDate(),
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
            <Tooltip content="Change label">
              <Button
                icon="String"
                onClick={() => setIsInEditLabelMode((prevState) => !prevState)}
                type="ghost"
                aria-label="Change label"
              />
            </Tooltip>
            <Tooltip content="Open in Charts">
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
                aria-label="Open in Charts"
              />
            </Tooltip>
            <Tooltip content="Open in Data Explorer">
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
                aria-label="Open in Data Explorer"
              />
            </Tooltip>
          </>
          <Tooltip content="Remove">
            <Button
              icon="Delete"
              onClick={onRemoveContainer}
              type="ghost"
              aria-label="Remove time series"
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
            <Tooltip content="Change label">
              <Button
                icon="String"
                onClick={() => setIsInEditLabelMode((prevState) => !prevState)}
                type="ghost"
                aria-label="Change label"
              />
            </Tooltip>
            <Tooltip content="Open in Data Explorer">
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
                aria-label="Open in Data Explorer"
              />
            </Tooltip>
          </>
          <Tooltip content="Remove">
            <Button
              icon="Delete"
              onClick={onRemoveContainer}
              type="ghost"
              aria-label="Remove 3D-model"
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
            <Tooltip content="Change label">
              <Button
                icon="String"
                onClick={() => setIsInEditLabelMode((prevState) => !prevState)}
                type="ghost"
                aria-label="Change label"
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
                  ? `Summarization is unavailable for this ${selectedContainer.type} (Experimental)`
                  : `Summarize the ${selectedContainer.type} (Experimental)`
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

            <Tooltip content="Open in Data Explorer">
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
                aria-label="Open document"
              />
            </Tooltip>
          </>
          <Tooltip content="Remove">
            <Button
              icon="Delete"
              onClick={() => onRemoveContainer()}
              aria-label="Remove document"
              type="ghost"
            />
          </Tooltip>
        </ToolBar>
      </TooltipToolBarContainer>
    );
  }

  return null;
};

export default ContainerTooltip;
