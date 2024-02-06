/*!
 * Copyright 2023 Cognite AS
 */

import { AnnotationModel, AnnotationsObjectDetection } from '@cognite/sdk';

import { Mock, It } from 'moq.ts';
import { ImageAnnotationObject } from '../src/annotation/ImageAnnotationObject';
import { Image360RevisionEntity } from '../src/entity/Image360RevisionEntity';
import { Image360DataProvider, Image360Descriptor } from '@reveal/data-providers';
import { Image360VisualizationBox } from '../src/entity/Image360VisualizationBox';
import { SceneHandler } from '@reveal/utilities';

import { Matrix4, PerspectiveCamera, Raycaster, Vector2, Vector3 } from 'three';
import { Image360AnnotationFilter } from '../src/annotation/Image360AnnotationFilter';

describe(Image360RevisionEntity.name, () => {
  test('.annotation returns input annotation', () => {
    const annotation = createAnnotationMock('an annotation');

    const annotationObject = ImageAnnotationObject.createAnnotationObject(annotation, 'front');

    const retrievedAnnotation = annotationObject?.annotation;

    expect(annotation).toEqual(retrievedAnnotation);
  });

  test('Intersect prioritizes small annotations', async () => {
    const annotations: AnnotationModel[] = [
      {
        annotatedResourceId: 1,
        annotationType: 'images.ObjectDetection',
        status: 'approved',
        data: {
          label: 'bigger annotation',
          boundingBox: {
            xMin: 0.2,
            xMax: 0.4,
            yMin: 0.2,
            yMax: 0.4
          }
        }
      } as AnnotationModel,
      {
        annotatedResourceId: 1,
        annotationType: 'images.ObjectDetection',
        status: 'approved',
        data: {
          label: 'smaller annotation',
          polygon: {
            vertices: [
              { x: 0.25, y: 0.25 },
              { x: 0.25, y: 0.35 },
              { x: 0.35, y: 0.3 }
            ]
          }
        }
      } as AnnotationModel
    ];

    const imageDescriptor: Image360Descriptor = {
      faceDescriptors: [{ fileId: 1, face: 'front', mimeType: 'image/jpeg' }]
    };
    const createImage360VisualizationBox = () =>
      new Image360VisualizationBox(new Matrix4().identity(), new SceneHandler(), { deviceType: 'desktop' });

    const revision = new Image360RevisionEntity(
      createMockDataProvider(annotations),
      imageDescriptor,
      createImage360VisualizationBox(),
      new Image360AnnotationFilter({})
    );

    const revisionWithReversedAnnotations = new Image360RevisionEntity(
      createMockDataProvider([...annotations].reverse()),
      imageDescriptor,
      createImage360VisualizationBox(),
      new Image360AnnotationFilter({})
    );

    const annotationObjects = await revision.getAnnotations();
    const reverseAnnotationObjects = await revisionWithReversedAnnotations.getAnnotations();

    const raycaster = new Raycaster();
    const camera = new PerspectiveCamera(90, 1, 0.1, 100);
    camera.lookAt(new Vector3(0, 0, 1));
    camera.updateWorldMatrix(false, false);
    raycaster.setFromCamera(new Vector2(-0.4, 0.4), camera);

    const intersectedAnnotation = revision.intersectAnnotations(raycaster);
    const intersectedAnnotationReversed = revisionWithReversedAnnotations.intersectAnnotations(raycaster);

    expect((intersectedAnnotation!.annotation.data as AnnotationsObjectDetection).label).toBe('smaller annotation');
    expect((intersectedAnnotationReversed!.annotation.data as AnnotationsObjectDetection).label).toBe(
      'smaller annotation'
    );

    annotationObjects.forEach(a => a.dispose());
    reverseAnnotationObjects.forEach(a => a.dispose());
  });
});

function createAnnotationMock(label: string): AnnotationModel {
  return new Mock<AnnotationModel>()
    .setup(p => p.annotationType)
    .returns('images.ObjectDetection')
    .setup(p => p.data)
    .returns({ label, boundingBox: { xMin: 0.0, xMax: 1.0, yMin: 0.0, yMax: 1.0 } })
    .object();
}

function createMockDataProvider(annotations: AnnotationModel[]): Image360DataProvider {
  return new Mock<Image360DataProvider>()
    .setup(p => p.get360ImageAnnotations(It.IsAny()))
    .returnsAsync(annotations)
    .object();
}
