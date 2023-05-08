import { createLink } from '@cognite/cdf-utilities';
import { Button, Pagination, ToolBar, Tooltip } from '@cognite/cogs.js';
import { ContainerType } from '@cognite/unified-file-viewer';
import dayjs from 'dayjs';
import React, { useCallback, useState } from 'react';
import DateRangePrompt from '../../components/DateRangePrompt';
import { TooltipToolBarContainer } from '../../TooltipContainer';
import { IndustryCanvasContainerConfig } from '../../types';
import getDefaultContainerLabel from '../../utils/getDefaultContainerLabel';
import getContainerText from './getContainerText';
import LabelToolbar from './LabelToolbar';
import type { OCRAnnotationPageResult } from '@data-exploration-lib/domain-layer';

const navigateToPath = (path: string) => {
  const link = createLink(path);
  window.open(link, '_blank');
};

type ContainerTooltipProps = {
  container: IndustryCanvasContainerConfig;
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
  container,
  onUpdateContainer,
  onRemoveContainer,
  onAddSummarizationSticky,
  shamefulNumPages,
  isOcrDataLoading,
  ocrData,
  isLoadingSummary,
  setIsLoadingSummary,
}) => {
  const [isInEditLabelMode, setIsInEditLabelMode] = useState(false);

  const onSaveLabel = useCallback(
    (label: string) => {
      if (container === undefined) {
        return;
      }

      onUpdateContainer({
        ...container,
        label: label.trim() || getDefaultContainerLabel(container),
      });
      setIsInEditLabelMode(false);
    },
    [container, onUpdateContainer]
  );

  const onClose = useCallback(() => {
    setIsInEditLabelMode(false);
  }, []);

  if (container.type === ContainerType.TABLE) {
    if (container.metadata.resourceType === undefined) {
      throw new Error('resourceType is undefined');
    }
    if (
      container.metadata.resourceType !== 'asset' &&
      container.metadata.resourceType !== 'event'
    ) {
      throw new Error('resourceType must be one of event and asset');
    }

    return (
      <TooltipToolBarContainer>
        {isInEditLabelMode && (
          <LabelToolbar
            onClose={onClose}
            onSave={onSaveLabel}
            initialValue={container.label}
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
                    `/explore/${container.metadata.resourceType}/${container.metadata.resourceId}`
                  );
                }}
                type="ghost"
                aria-label={`Open ${container.metadata.resourceType} in Data Explorer`}
              />
            </Tooltip>
          </>
          <Tooltip content="Remove">
            <Button
              icon="Delete"
              onClick={onRemoveContainer}
              type="ghost"
              aria-label={`Remove ${container.metadata.resourceType}`}
            />
          </Tooltip>
        </ToolBar>
      </TooltipToolBarContainer>
    );
  }

  if (container.type === ContainerType.TIMESERIES) {
    return (
      <TooltipToolBarContainer>
        {isInEditLabelMode && (
          <LabelToolbar
            onClose={onClose}
            onSave={onSaveLabel}
            initialValue={container.label}
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
                startDate: container.startDate,
                endDate: container.endDate,
              }}
              onComplete={(dateRange) =>
                onUpdateContainer({
                  // TODO: Enforce with types
                  ...container,
                  startDate: dayjs(dateRange.startDate).startOf('day').toDate(),
                  endDate: dayjs(dateRange.endDate).endOf('day').toDate(),
                })
              }
            />
            <Tooltip content="Open in Data Explorer">
              <Button
                icon="ExternalLink"
                onClick={() => {
                  navigateToPath(
                    `/explore/timeSeries/${container.metadata.resourceId}`
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

  if (container.type === ContainerType.REVEAL) {
    return (
      <TooltipToolBarContainer>
        {isInEditLabelMode && (
          <LabelToolbar
            onClose={onClose}
            onSave={onSaveLabel}
            initialValue={container.label}
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
                  navigateToPath(`/explore/threeD/${container.id}`);
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
    container.type === ContainerType.DOCUMENT ||
    container.type === ContainerType.IMAGE ||
    container.type === ContainerType.TEXT
  ) {
    const ocrText = getContainerText(container, ocrData);
    const onSummarizationClick = async () => {
      if (onAddSummarizationSticky) {
        setIsLoadingSummary(true);
        await onAddSummarizationSticky(
          container,
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
            initialValue={container.label}
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
            {container.type === ContainerType.DOCUMENT &&
              shamefulNumPages !== undefined &&
              shamefulNumPages > 1 && (
                <Pagination
                  totalPages={shamefulNumPages}
                  hideItemsPerPage
                  currentPage={container.page}
                  size="small"
                  onPageChange={(page) =>
                    onUpdateContainer({
                      ...container,
                      page,
                    })
                  }
                />
              )}

            <Tooltip
              content={
                ocrText.length === 0
                  ? `Summarization is unavailable for this ${container.type} (Experimental)`
                  : `Summarize the ${container.type} (Experimental)`
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
                    `/explore/file/${container.metadata.resourceId}`
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
