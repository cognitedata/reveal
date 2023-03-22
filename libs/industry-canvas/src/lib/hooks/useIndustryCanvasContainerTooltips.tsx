import { createLink } from '@cognite/cdf-utilities';
import { Button, Link } from '@cognite/cogs.js';
import { TooltipAnchorPosition } from '@cognite/unified-file-viewer';
import dayjs from 'dayjs';
import DateRangePrompt from '../components/DateRangePrompt';
import { getContainerId } from '../utils/utils';
import { useMemo } from 'react';
import { TooltipContainer } from '../TooltipContainer';
import {
  ContainerReference,
  ContainerReferenceType,
  ContainerReferenceWithoutDimensions,
} from '../types';

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
              <Link
                href={createLink(`/explore/asset/${clickedContainer.id}`)}
                target="_blank"
              />
              <Button
                icon="Close"
                onClick={() => removeContainerReference(clickedContainer)}
                type="ghost"
              />
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
                onComplete={(dateRange) => {
                  console.log({
                    id: clickedContainer.id,
                    type: ContainerReferenceType.TIMESERIES,
                    startDate: dayjs(dateRange.startDate)
                      .startOf('day')
                      .toDate(),
                    endDate: dayjs(dateRange.endDate).startOf('day').toDate(),
                  });

                  updateContainerReference({
                    id: clickedContainer.id,
                    type: ContainerReferenceType.TIMESERIES,
                    startDate: dayjs(dateRange.startDate)
                      .startOf('day')
                      .toDate(),
                    endDate: dayjs(dateRange.endDate).endOf('day').toDate(),
                  });
                }}
              />
              <Link
                href={createLink(`/explore/timeSeries/${clickedContainer.id}`)}
                target="_blank"
              />
              <Button
                icon="Close"
                onClick={() => removeContainerReference(clickedContainer)}
                type="ghost"
              />
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
              <Link
                href={createLink(`/explore/file/${clickedContainer.id}`)}
                target="_blank"
              />
              <Button
                icon="Close"
                onClick={() => removeContainerReference(clickedContainer)}
                type="ghost"
              />
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
