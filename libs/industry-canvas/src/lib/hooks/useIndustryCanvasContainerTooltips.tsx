import { createLink } from '@cognite/cdf-utilities';
import { Button, Link, Tooltip } from '@cognite/cogs.js';
import { TooltipAnchorPosition } from '@cognite/unified-file-viewer';
import dayjs from 'dayjs';
import { useMemo } from 'react';
import DateRangePrompt from '../components/DateRangePrompt';
import { TooltipContainer } from '../TooltipContainer';
import {
  ContainerReference,
  ContainerReferenceType,
  ContainerReferenceWithoutDimensions,
} from '../types';
import { getContainerId } from '../utils/utils';

const useIndustryCanvasContainerTooltips = ({
  clickedContainer,
  updateContainerReference,
  removeContainerReference,
}: {
  clickedContainer: ContainerReference | undefined;
  updateContainerReference: (
    containerReference: ContainerReferenceWithoutDimensions
  ) => void;
  removeContainerReference: (containerReference: ContainerReference) => void;
}) => {
  return useMemo(() => {
    if (clickedContainer === undefined) {
      return [];
    }

    if (clickedContainer.type === ContainerReferenceType.ASSET) {
      return [
        {
          targetId: getContainerId(clickedContainer),
          content: (
            <TooltipContainer>
              <Tooltip content="Open asset in Data Explorer">
                <Link
                  href={createLink(
                    `/explore/asset/${clickedContainer.resourceId}`
                  )}
                  target="_blank"
                />
              </Tooltip>
              <Tooltip content="Remove asset from canvas">
                <Button
                  icon="Delete"
                  onClick={() => removeContainerReference(clickedContainer)}
                  type="ghost"
                />
              </Tooltip>
            </TooltipContainer>
          ),
          anchorTo: TooltipAnchorPosition.TOP_RIGHT,
        },
      ];
    }

    if (clickedContainer.type === ContainerReferenceType.TIMESERIES) {
      return [
        {
          targetId: getContainerId(clickedContainer),
          content: (
            <TooltipContainer>
              <DateRangePrompt
                initialRange={{
                  startDate: clickedContainer.startDate,
                  endDate: clickedContainer.endDate,
                }}
                onComplete={(dateRange) =>
                  updateContainerReference({
                    resourceId: clickedContainer.resourceId,
                    id: clickedContainer.id,
                    type: ContainerReferenceType.TIMESERIES,
                    startDate: dayjs(dateRange.startDate)
                      .startOf('day')
                      .toDate(),
                    endDate: dayjs(dateRange.endDate).endOf('day').toDate(),
                  })
                }
              />
              <Tooltip content="Open time series in Data Explorer">
                <Link
                  href={createLink(
                    `/explore/timeSeries/${clickedContainer.resourceId}`
                  )}
                  target="_blank"
                />
              </Tooltip>
              <Tooltip content="Remove time series from canvas">
                <Button
                  icon="Delete"
                  onClick={() => removeContainerReference(clickedContainer)}
                  type="ghost"
                />
              </Tooltip>
            </TooltipContainer>
          ),
          anchorTo: TooltipAnchorPosition.TOP_RIGHT,
        },
      ];
    }

    if (clickedContainer.type === ContainerReferenceType.THREE_D) {
      return [
        {
          targetId: getContainerId(clickedContainer),
          content: (
            <TooltipContainer>
              <Tooltip content="Open 3D-model in Data Explorer">
                <Link
                  href={createLink(`/explore/threeD/${clickedContainer.id}`)}
                  target="_blank"
                />
              </Tooltip>
              <Tooltip content="Remove 3D-model from canvas">
                <Button
                  icon="Delete"
                  onClick={() => removeContainerReference(clickedContainer)}
                  type="ghost"
                />
              </Tooltip>
            </TooltipContainer>
          ),
          anchorTo: TooltipAnchorPosition.TOP_RIGHT,
        },
      ];
    }

    if (clickedContainer.type === ContainerReferenceType.FILE) {
      return [
        {
          targetId: getContainerId(clickedContainer),
          content: (
            <TooltipContainer>
              <Tooltip content="Open file in Data Explorer">
                <Link
                  href={createLink(
                    `/explore/file/${clickedContainer.resourceId}`
                  )}
                  target="_blank"
                />
              </Tooltip>

              <Tooltip content="Remove file from canvas">
                <Button
                  icon="Delete"
                  onClick={() => removeContainerReference(clickedContainer)}
                  type="ghost"
                />
              </Tooltip>
            </TooltipContainer>
          ),
          anchorTo: TooltipAnchorPosition.TOP_RIGHT,
        },
      ];
    }

    return [];
  }, [clickedContainer, removeContainerReference, updateContainerReference]);
};

export default useIndustryCanvasContainerTooltips;
