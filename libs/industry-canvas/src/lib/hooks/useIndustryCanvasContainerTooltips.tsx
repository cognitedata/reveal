import { createLink } from '@cognite/cdf-utilities';
import { Button, Link, Pagination, ToolBar, Tooltip } from '@cognite/cogs.js';
import {
  ContainerConfig,
  DocumentContainerProps,
  TooltipAnchorPosition,
  getPdfCache,
} from '@cognite/unified-file-viewer';
import dayjs from 'dayjs';
import { useEffect, useMemo, useState } from 'react';
import DateRangePrompt from '../components/DateRangePrompt';
import { TooltipContainer, TooltipToolBarContainer } from '../TooltipContainer';
import { ContainerReference, ContainerReferenceType } from '../types';
import { getContainerId } from '../utils/utils';
import { UseManagedStateReturnType } from './useManagedState';

const useIndustryCanvasContainerTooltips = ({
  clickedContainerReference,
  clickedContainer,
  updateContainerReference,
  removeContainerReference,
}: {
  clickedContainerReference: ContainerReference | undefined;
  clickedContainer: ContainerConfig | undefined;
  updateContainerReference: UseManagedStateReturnType['updateContainerReference'];
  removeContainerReference: (containerReference: ContainerReference) => void;
}) => {
  const [numberOfPages, setNumberOfPages] = useState<number | undefined>(
    undefined
  );

  useEffect(() => {
    (async () => {
      if (
        clickedContainerReference === undefined ||
        clickedContainer === undefined
      ) {
        return;
      }

      if (clickedContainerReference.type === 'file') {
        try {
          const numPages = await getPdfCache().getPdfNumPages(
            (clickedContainer as DocumentContainerProps).url
          );
          setNumberOfPages(numPages);
        } catch (e) {
          console.warn(e);
        }
      }
    })();
  }, [clickedContainerReference, clickedContainer]);

  return useMemo(() => {
    if (clickedContainerReference === undefined) {
      return [];
    }

    if (clickedContainerReference.type === ContainerReferenceType.ASSET) {
      return [
        {
          targetId: getContainerId(clickedContainerReference),
          content: (
            <TooltipContainer>
              <Tooltip content="Open asset in Data Explorer">
                <Link
                  href={createLink(
                    `/explore/asset/${clickedContainerReference.resourceId}`
                  )}
                  target="_blank"
                />
              </Tooltip>
              <Tooltip content="Remove asset from canvas">
                <Button
                  icon="Delete"
                  onClick={() =>
                    removeContainerReference(clickedContainerReference)
                  }
                  type="ghost"
                />
              </Tooltip>
            </TooltipContainer>
          ),
          anchorTo: TooltipAnchorPosition.TOP_RIGHT,
        },
      ];
    }

    if (clickedContainerReference.type === ContainerReferenceType.TIMESERIES) {
      return [
        {
          targetId: getContainerId(clickedContainerReference),
          content: (
            <TooltipContainer>
              <DateRangePrompt
                initialRange={{
                  startDate: clickedContainerReference.startDate,
                  endDate: clickedContainerReference.endDate,
                }}
                onComplete={(dateRange) =>
                  updateContainerReference({
                    resourceId: clickedContainerReference.resourceId,
                    id: clickedContainerReference.id,
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
                    `/explore/timeSeries/${clickedContainerReference.resourceId}`
                  )}
                  target="_blank"
                />
              </Tooltip>
              <Tooltip content="Remove time series from canvas">
                <Button
                  icon="Delete"
                  onClick={() =>
                    removeContainerReference(clickedContainerReference)
                  }
                  type="ghost"
                />
              </Tooltip>
            </TooltipContainer>
          ),
          anchorTo: TooltipAnchorPosition.TOP_RIGHT,
        },
      ];
    }

    if (clickedContainerReference.type === ContainerReferenceType.THREE_D) {
      return [
        {
          targetId: getContainerId(clickedContainerReference),
          content: (
            <TooltipContainer>
              <Tooltip content="Open 3D-model in Data Explorer">
                <Link
                  href={createLink(
                    `/explore/threeD/${clickedContainerReference.id}`
                  )}
                  target="_blank"
                />
              </Tooltip>
              <Tooltip content="Remove 3D-model from canvas">
                <Button
                  icon="Delete"
                  onClick={() =>
                    removeContainerReference(clickedContainerReference)
                  }
                  type="ghost"
                />
              </Tooltip>
            </TooltipContainer>
          ),
          anchorTo: TooltipAnchorPosition.TOP_RIGHT,
        },
      ];
    }

    if (clickedContainerReference.type === ContainerReferenceType.FILE) {
      return [
        {
          targetId: getContainerId(clickedContainerReference),
          content: (
            <TooltipToolBarContainer>
              <ToolBar direction="horizontal">
                {numberOfPages !== undefined && numberOfPages > 1 && (
                  <Pagination
                    totalPages={numberOfPages}
                    hideItemsPerPage
                    currentPage={clickedContainerReference.page}
                    size="small"
                    onPageChange={(page) =>
                      updateContainerReference({
                        ...clickedContainerReference,
                        page,
                      })
                    }
                  />
                )}

                <>
                  <Tooltip content="Open file in Data Explorer">
                    <Link
                      href={createLink(
                        `/explore/file/${clickedContainerReference.resourceId}`
                      )}
                      target="_blank"
                    />
                  </Tooltip>

                  <Tooltip content="Remove file from canvas">
                    <Button
                      icon="Delete"
                      onClick={() =>
                        removeContainerReference(clickedContainerReference)
                      }
                      type="ghost"
                    />
                  </Tooltip>
                </>
              </ToolBar>
            </TooltipToolBarContainer>
          ),
          anchorTo: TooltipAnchorPosition.TOP_RIGHT,
        },
      ];
    }

    return [];
  }, [
    clickedContainerReference,
    removeContainerReference,
    updateContainerReference,
    numberOfPages,
  ]);
};

export default useIndustryCanvasContainerTooltips;
