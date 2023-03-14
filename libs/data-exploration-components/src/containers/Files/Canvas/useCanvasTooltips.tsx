import useCanvasFileContainerTooltips from '@data-exploration-components/containers/Files/Canvas/useCanvasFileContainerTooltips';
import useCanvasFileLinkTooltips from '@data-exploration-components/containers/Files/Canvas/useCanvasFileLinkTooltips';
import { PagedFileReference } from '@data-exploration-components/containers/Files/Canvas/useCanvasFilesFromUrl';
import { ExtendedAnnotation } from '@data-exploration-lib/core';
import { useMemo } from 'react';
import useCanvasAssetTooltips from './useCanvasAssetTooltips';

type UseTooltipsParams = {
  annotations: ExtendedAnnotation[];
  selectedAnnotation: ExtendedAnnotation | undefined;
  clickedContainer: PagedFileReference | undefined;

  onAddFile: (file: PagedFileReference) => void;
};

const useCanvasTooltips = ({
  annotations,
  selectedAnnotation,
  clickedContainer,
  onAddFile,
}: UseTooltipsParams) => {
  const hoverTooltips = useCanvasAssetTooltips(selectedAnnotation);
  const fileLinkTooltips = useCanvasFileLinkTooltips({
    annotations,
    selectedAnnotation,
    onAddFile,
  });
  const fileContainerTooltips =
    useCanvasFileContainerTooltips(clickedContainer);

  return useMemo(() => {
    return [...hoverTooltips, ...fileLinkTooltips, ...fileContainerTooltips];
  }, [hoverTooltips, fileLinkTooltips, fileContainerTooltips]);
};

export default useCanvasTooltips;
