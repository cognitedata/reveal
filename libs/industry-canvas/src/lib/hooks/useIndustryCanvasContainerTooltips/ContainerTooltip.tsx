import { createLink } from '@cognite/cdf-utilities';
import { Button, Pagination, ToolBar, Tooltip } from '@cognite/cogs.js';
import { ContainerType } from '@cognite/unified-file-viewer';
import dayjs from 'dayjs';
import React, { useCallback, useState } from 'react';
import DateRangePrompt from '../../components/DateRangePrompt';
import { TooltipToolBarContainer } from '../../TooltipContainer';
import {
  IndustryCanvasContainerConfig,
  isIndustryCanvasTimeSeriesContainer,
} from '../../types';
import getDefaultContainerLabel from '../../utils/getDefaultContainerLabel';
import getContainerText from './getContainerText';
import LabelToolbar from './LabelToolbar';
import type { OCRAnnotationPageResult } from '@data-exploration-lib/domain-layer';
import {
  OnUpdateTooltipsOptions,
  TooltipsOptions,
} from '../useTooltipsOptions';

const navigateToPath = (path: string) => {
  const link = createLink(path);
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
    },
    [selectedContainer, onUpdateContainer]
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
                }}
                type="ghost"
                aria-label={`Open ${selectedContainer.metadata.resourceType} in Data Explorer`}
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
            <Tooltip content="Change label">
              <Button
                icon="String"
                onClick={() => setIsInEditLabelMode((prevState) => !prevState)}
                type="ghost"
                aria-label="Change label"
              />
            </Tooltip>
            <DateRangePrompt
              initialRange={{
                startDate: selectedContainer.startDate,
                endDate: selectedContainer.endDate,
              }}
              shouldApplyToAllTimeSeries={
                tooltipsOptions[ContainerType.TIMESERIES].shouldApplyToAll
              }
              onToggleShouldApplyToAllTimeSeries={() => {
                onUpdateTooltipsOptions(ContainerType.TIMESERIES, {
                  shouldApplyToAll:
                    !tooltipsOptions[ContainerType.TIMESERIES].shouldApplyToAll,
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
              }}
            />
            <Tooltip content="Open in Data Explorer">
              <Button
                icon="ExternalLink"
                onClick={() => {
                  navigateToPath(
                    `/explore/timeSeries/${selectedContainer.metadata.resourceId}`
                  );
                }}
                type="ghost"
                aria-label="Open time series"
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
                }}
                type="ghost"
                aria-label="Open 3D-model"
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
