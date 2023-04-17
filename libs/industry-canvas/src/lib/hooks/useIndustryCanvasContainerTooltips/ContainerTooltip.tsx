import { createLink } from '@cognite/cdf-utilities';
import { Button, Link, Pagination, ToolBar, Tooltip } from '@cognite/cogs.js';
import { ContainerType } from '@cognite/unified-file-viewer';
import dayjs from 'dayjs';
import React, { useCallback, useState } from 'react';
import DateRangePrompt from '../../components/DateRangePrompt';
import { TooltipToolBarContainer } from '../../TooltipContainer';
import { IndustryCanvasContainerConfig } from '../../types';
import getDefaultContainerLabel from '../../utils/getDefaultContainerLabel';
import LabelToolbar from './LabelToolbar';

type ContainerTooltipProps = {
  container: IndustryCanvasContainerConfig;
  onUpdateContainer: (containerConfig: IndustryCanvasContainerConfig) => void;
  onRemoveContainer: () => void;
  shamefulNumPages: number | undefined;
};

const ContainerTooltip: React.FC<ContainerTooltipProps> = ({
  container,
  onUpdateContainer,
  onRemoveContainer,
  shamefulNumPages,
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
    // NOTE: This is going to break when we add support for Events etc
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
          <Tooltip content="Change label">
            <Button
              icon="String"
              onClick={() => setIsInEditLabelMode((prevState) => !prevState)}
              type="ghost"
            />
          </Tooltip>
          <Tooltip content="Open asset in Data Explorer">
            <Link
              href={createLink(
                `/explore/asset/${container.metadata.resourceId}`
              )}
              target="_blank"
            />
          </Tooltip>
          <Tooltip content="Remove asset from canvas">
            <Button
              icon="Delete"
              onClick={() => onRemoveContainer()}
              type="ghost"
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
          <Tooltip content="Change label">
            <Button
              icon="String"
              onClick={() => setIsInEditLabelMode((prevState) => !prevState)}
              type="ghost"
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
          <Tooltip content="Open time series in Data Explorer">
            <Link
              href={createLink(
                `/explore/timeSeries/${container.metadata.resourceId}`
              )}
              target="_blank"
            />
          </Tooltip>
          <Tooltip content="Remove time series from canvas">
            <Button
              icon="Delete"
              onClick={() => onRemoveContainer()}
              type="ghost"
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
          <Tooltip content="Change label">
            <Button
              icon="String"
              onClick={() => setIsInEditLabelMode((prevState) => !prevState)}
              type="ghost"
            />
          </Tooltip>
          <Tooltip content="Open 3D-model in Data Explorer">
            <Link
              href={createLink(`/explore/threeD/${container.id}`)}
              target="_blank"
            />
          </Tooltip>
          <Tooltip content="Remove 3D-model from canvas">
            <Button
              icon="Delete"
              onClick={() => onRemoveContainer()}
              type="ghost"
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
          <Tooltip content="Change label">
            <Button
              icon="String"
              onClick={() => setIsInEditLabelMode((prevState) => !prevState)}
              type="ghost"
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

          <>
            <Tooltip content="Open file in Data Explorer">
              <Link
                href={createLink(
                  `/explore/file/${container.metadata.resourceId}`
                )}
                target="_blank"
              />
            </Tooltip>

            <Tooltip content="Remove file from canvas">
              <Button
                icon="Delete"
                onClick={() => onRemoveContainer()}
                type="ghost"
              />
            </Tooltip>
          </>
        </ToolBar>
      </TooltipToolBarContainer>
    );
  }

  return null;
};

export default ContainerTooltip;
