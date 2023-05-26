import { useMemo } from 'react';

import {
  PagedFileReference,
  useCanvasFilesFromUrl,
} from '@data-exploration-components/containers/Files/Canvas/useCanvasFilesFromUrl';
import { getPagedContainerId } from '@data-exploration-components/containers/Files/Canvas/utils';

import { createLink } from '@cognite/cdf-utilities';
import { Button, Link } from '@cognite/cogs.js';
import { TooltipAnchorPosition } from '@cognite/unified-file-viewer';

import { TooltipContainer } from './TooltipContainer';

const useCanvasFileContainerTooltips = (
  clickedContainer: PagedFileReference | undefined
) => {
  const { removeFile } = useCanvasFilesFromUrl();

  return useMemo(() => {
    if (clickedContainer === undefined) {
      return [];
    }

    return [
      {
        targetId: getPagedContainerId(
          clickedContainer.id,
          clickedContainer.page
        ),
        content: (
          <TooltipContainer>
            <Link
              href={createLink(`/explore/file/${clickedContainer.id}`)}
              target="_blank"
            />
            <Button
              icon="Close"
              onClick={() => removeFile(clickedContainer)}
              type="ghost"
            />
          </TooltipContainer>
        ),
        anchorTo: TooltipAnchorPosition.TOP_RIGHT,
      },
    ];
  }, [clickedContainer, removeFile]);
};

export default useCanvasFileContainerTooltips;
