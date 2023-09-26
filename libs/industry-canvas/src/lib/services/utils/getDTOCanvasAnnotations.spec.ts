import { AnnotationType } from '@cognite/unified-file-viewer';

import { CanvasAnnotation } from '../../types';

import { getDTOCanvasAnnotations } from './getDTOCanvasAnnotations';

describe('getDTOCanvasAnnotations', () => {
  const mockCanvasExternalIdA = 'eid-A';
  const mockCanvasExternalIdB = 'eid-B';
  const canvasAnnotationId = '12';
  const annotationType = AnnotationType.STICKY;

  const canvasAnnotations: CanvasAnnotation[] = [
    {
      id: canvasAnnotationId,
      type: annotationType,
    } as CanvasAnnotation,
  ];

  const dtoAnnotationsA = getDTOCanvasAnnotations(
    canvasAnnotations,
    mockCanvasExternalIdA,
    {}
  );
  const dtoAnnotationsB = getDTOCanvasAnnotations(
    canvasAnnotations,
    mockCanvasExternalIdB,
    {}
  );

  it('Should same annotations saved with different ids based on the id of the canvas they are in', () => {
    const dtoIdA = dtoAnnotationsA[0].externalId;
    const dtoIdB = dtoAnnotationsB[0].externalId;
    expect(dtoIdA).not.toEqual(dtoIdB);
  });

  it('Should annotations DTO get externalIds based on canvas externalId', () => {
    expect(dtoAnnotationsA).toEqual([
      {
        externalId: `${mockCanvasExternalIdA}_${canvasAnnotationId}`,
        id: canvasAnnotationId,
        annotationType: annotationType,
        containerId: undefined,
        isSelectable: undefined,
        isDraggable: undefined,
        isResizable: undefined,
        properties: {},
      },
    ]);
  });
});
