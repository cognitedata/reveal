import {
  ContainerType,
  getPdfCache,
  TooltipAnchorPosition,
} from '@cognite/unified-file-viewer';
import React, { useEffect, useMemo, useState } from 'react';
import { IndustryCanvasContainerConfig } from '../../types';
import { UseManagedStateReturnType } from '../useManagedState';
import ContainerTooltip from './ContainerTooltip';

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

    return [
      {
        targetId: clickedContainer.id,
        content: (
          <ContainerTooltip
            key={clickedContainer.id}
            container={clickedContainer}
            onUpdateContainer={(
              containerConfig: IndustryCanvasContainerConfig
            ) => updateContainerById(containerConfig.id, containerConfig)}
            onRemoveContainer={() => removeContainerById(clickedContainer.id)}
            shamefulNumPages={numberOfPages}
          />
        ),
        anchorTo: TooltipAnchorPosition.TOP_RIGHT,
      },
    ];
  }, [
    clickedContainer,
    removeContainerById,
    updateContainerById,
    numberOfPages,
  ]);
};

export default useIndustryCanvasContainerTooltips;
