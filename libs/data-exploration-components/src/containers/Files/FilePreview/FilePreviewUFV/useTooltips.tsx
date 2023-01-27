import { useFlag } from '@cognite/react-feature-flags';
import useHoverTooltips from './useHoverTooltips';
import { useMemo } from 'react';
import useFileLinkTooltips from './useFileLinkTooltips';
import { ExtendedAnnotation } from '@data-exploration-lib/core';

const useTooltips = ({
  isTooltipsEnabled,
  fileId,
  annotations,
  hoverId,
  selectedAnnotations,
}: {
  isTooltipsEnabled: boolean;
  fileId: number;
  annotations: ExtendedAnnotation[];
  hoverId: string | undefined;
  selectedAnnotations: ExtendedAnnotation[];
}) => {
  const { isEnabled: isCanvasEnabled } = useFlag('UFV_CANVAS', {
    forceRerender: true,
    fallback: false,
  });

  const hoverTooltips = useHoverTooltips(
    isTooltipsEnabled,
    annotations,
    hoverId
  );
  const fileLinkTooltips = useFileLinkTooltips(
    isCanvasEnabled,
    fileId,
    annotations,
    selectedAnnotations
  );

  return useMemo(() => {
    return [...hoverTooltips, ...fileLinkTooltips];
  }, [hoverTooltips, fileLinkTooltips]);
};

export default useTooltips;
