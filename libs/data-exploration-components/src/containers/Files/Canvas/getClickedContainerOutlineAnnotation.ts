import { PagedFileReference } from '@data-exploration-components/containers/Files/Canvas/useCanvasFilesFromUrl';
import { getPagedContainerId } from '@data-exploration-components/containers/Files/Canvas/utils';

import { Annotation, AnnotationType } from '@cognite/unified-file-viewer';

export const getClickedContainerOutlineAnnotation = (
  clickedContainer: PagedFileReference | undefined
): Annotation[] => {
  if (clickedContainer === undefined) {
    return [];
  }

  return [
    {
      id: 'container-outline',
      containerId: getPagedContainerId(
        clickedContainer.id,
        clickedContainer.page
      ),
      type: AnnotationType.RECTANGLE,
      x: 0,
      y: 0,
      width: 1,
      height: 1,
      style: {
        stroke: 'lightblue',
        strokeWidth: 2,
      },
    },
  ];
};
