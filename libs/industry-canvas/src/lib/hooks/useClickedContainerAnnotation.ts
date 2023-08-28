import { useMemo } from 'react';

import { ExtendedAnnotation } from '@data-exploration-lib/core';

const useClickedContainerAnnotation = ({
  containerAnnotations,
  clickedContainerAnnotationId,
}: {
  containerAnnotations: ExtendedAnnotation[];
  clickedContainerAnnotationId: string | undefined;
}): ExtendedAnnotation | undefined => {
  return useMemo(
    () =>
      containerAnnotations.find(
        (annotation) => annotation.id === clickedContainerAnnotationId
      ),
    [containerAnnotations, clickedContainerAnnotationId]
  );
};

export default useClickedContainerAnnotation;
