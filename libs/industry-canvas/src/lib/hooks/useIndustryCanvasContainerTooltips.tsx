import { createLink } from '@cognite/cdf-utilities';
import { Button, Link, Pagination, ToolBar, Tooltip } from '@cognite/cogs.js';
import {
  ContainerType,
  getPdfCache,
  TooltipAnchorPosition,
} from '@cognite/unified-file-viewer';
import dayjs from 'dayjs';
import { useEffect, useMemo, useState } from 'react';
import DateRangePrompt from '../components/DateRangePrompt';
import { TooltipContainer, TooltipToolBarContainer } from '../TooltipContainer';
import { IndustryCanvasContainerConfig } from '../types';
import { UseManagedStateReturnType } from './useManagedState';

const useIndustryCanvasContainerTooltips = ({
  clickedContainer,
  updateContainerById,
  removeContainerById,
}: {
  clickedContainer: IndustryCanvasContainerConfig | undefined;
  updateContainerById: UseManagedStateReturnType['updateContainerById'];
  removeContainerById: UseManagedStateReturnType['removeContainerById'];
}) => {
  const [numberOfPages, setNumberOfPages] = useState<number | undefined>(
    undefined
  );

  useEffect(() => {
    (async () => {
      if (clickedContainer === undefined) {
        return;
      }

      if (clickedContainer.type !== ContainerType.DOCUMENT) {
        return;
      }

      try {
        const numPages = await getPdfCache().getPdfNumPages(
          clickedContainer.url
        );
        setNumberOfPages(numPages);
      } catch (e) {
        console.warn(e);
      }
    })();
  }, [clickedContainer]);

  return useMemo(() => {
    if (clickedContainer === undefined) {
      return [];
    }

    if (clickedContainer.type === ContainerType.TABLE) {
      // NOTE: This is going to break when we add support for Events etc
      return [
        {
          targetId: clickedContainer.id,
          content: (
            <TooltipContainer>
              <Tooltip content="Open asset in Data Explorer">
                <Link
                  href={createLink(
                    `/explore/asset/${clickedContainer.metadata.resourceId}`
                  )}
                  target="_blank"
                />
              </Tooltip>
              <Tooltip content="Remove asset from canvas">
                <Button
                  icon="Delete"
                  onClick={() => removeContainerById(clickedContainer.id)}
                  type="ghost"
                />
              </Tooltip>
            </TooltipContainer>
          ),
          anchorTo: TooltipAnchorPosition.TOP_RIGHT,
        },
      ];
    }

    if (clickedContainer.type === ContainerType.TIMESERIES) {
      return [
        {
          targetId: clickedContainer.id,
          content: (
            <TooltipContainer>
              <DateRangePrompt
                initialRange={{
                  startDate: clickedContainer.startDate,
                  endDate: clickedContainer.endDate,
                }}
                onComplete={(dateRange) =>
                  updateContainerById(clickedContainer.id, {
                    // TODO: Enforce with types
                    type: ContainerType.TIMESERIES,
                    startDate: dayjs(dateRange.startDate)
                      .startOf('day')
                      .toDate(),
                    endDate: dayjs(dateRange.endDate).endOf('day').toDate(),
                    metadata: {
                      resourceId: clickedContainer.metadata.resourceId!,
                    },
                  })
                }
              />
              <Tooltip content="Open time series in Data Explorer">
                <Link
                  href={createLink(
                    `/explore/timeSeries/${clickedContainer.metadata.resourceId}`
                  )}
                  target="_blank"
                />
              </Tooltip>
              <Tooltip content="Remove time series from canvas">
                <Button
                  icon="Delete"
                  onClick={() => removeContainerById(clickedContainer.id)}
                  type="ghost"
                />
              </Tooltip>
            </TooltipContainer>
          ),
          anchorTo: TooltipAnchorPosition.TOP_RIGHT,
        },
      ];
    }

    if (clickedContainer.type === ContainerType.REVEAL) {
      return [
        {
          targetId: clickedContainer.id,
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
                  onClick={() => removeContainerById(clickedContainer.id)}
                  type="ghost"
                />
              </Tooltip>
            </TooltipContainer>
          ),
          anchorTo: TooltipAnchorPosition.TOP_RIGHT,
        },
      ];
    }

    if (
      clickedContainer.type === ContainerType.DOCUMENT ||
      clickedContainer.type === ContainerType.IMAGE
    ) {
      return [
        {
          targetId: clickedContainer.id,
          content: (
            <TooltipToolBarContainer>
              <ToolBar direction="horizontal">
                {clickedContainer.type === ContainerType.DOCUMENT &&
                  numberOfPages !== undefined &&
                  numberOfPages > 1 && (
                    <Pagination
                      totalPages={numberOfPages}
                      hideItemsPerPage
                      currentPage={clickedContainer.page}
                      size="small"
                      onPageChange={(page) =>
                        updateContainerById(clickedContainer.id, {
                          ...clickedContainer,
                          page,
                        })
                      }
                    />
                  )}

                <>
                  <Tooltip content="Open file in Data Explorer">
                    <Link
                      href={createLink(
                        `/explore/file/${clickedContainer.metadata.resourceId}`
                      )}
                      target="_blank"
                    />
                  </Tooltip>

                  <Tooltip content="Remove file from canvas">
                    <Button
                      icon="Delete"
                      onClick={() => removeContainerById(clickedContainer.id)}
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
    clickedContainer,
    removeContainerById,
    updateContainerById,
    numberOfPages,
  ]);
};

export default useIndustryCanvasContainerTooltips;
