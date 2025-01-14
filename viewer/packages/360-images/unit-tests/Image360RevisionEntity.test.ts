/*!
 * Copyright 2023 Cognite AS
 */

import { AnnotationModel, AnnotationsObjectDetection } from '@cognite/sdk';

import { Mock, It } from 'moq.ts';
import { ImageAnnotationObject } from '../src/annotation/ImageAnnotationObject';
import { Image360RevisionEntity } from '../src/entity/Image360RevisionEntity';
import {
  ClassicDataSourceType,
  DataSourceType,
  DMDataSourceType,
  Image360Descriptor,
  Image360Provider
} from '@reveal/data-providers';
import { Image360VisualizationBox } from '../src/entity/Image360VisualizationBox';
import { SceneHandler } from '@reveal/utilities';

import { Matrix4, PerspectiveCamera, Raycaster, Vector2, Vector3 } from 'three';
import { Image360AnnotationFilter } from '../src/annotation/Image360AnnotationFilter';

const annotationFixture0 = {
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
} as AnnotationModel;

const annotationFixture1 = {
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
} as AnnotationModel;

const dmAnnotationFixture = {
  sourceType: 'dm',
  annotationIdentifier: { externalId: 'anAnnotation', space: 'aSpace' },
  assetRef: { externalId: 'anAsset', space: 'anotherSpace' },
  polygon: [
    new Vector3(5, -5, 1).normalize(),
    new Vector3(5, -1, 1).normalize(),
    new Vector3(1, -1, 1).normalize(),
    new Vector3(1, -5, 1).normalize()
  ],
  status: 'approved',
  connectedImageId: { externalId: 'anImage', space: 'aThirdSpace' }
} as DMDataSourceType['image360AnnotationType'];

const annotations: AnnotationModel[] = [annotationFixture0, annotationFixture1];

const raycaster = new Raycaster();
const camera = new PerspectiveCamera(90, 1, 0.1, 100);

describe(Image360RevisionEntity.name, () => {
  beforeEach(() => {
    camera.lookAt(new Vector3(0, 0, 1));
    camera.updateWorldMatrix(false, false);
    raycaster.setFromCamera(new Vector2(-0.4, 0.4), camera);
  });

  test('.annotation returns input annotation', () => {
    const annotation = createAnnotationMock('an annotation');

    const annotationObject = ImageAnnotationObject.createAnnotationObject(
      annotation,
      'front',
      new Matrix4().identity()
    );

    const retrievedAnnotation = annotationObject?.annotation;

    expect(annotation).toEqual(retrievedAnnotation);
  });

  test('Intersect intersects box annotation', async () => {
    const revision = createRevisionWithAnnotations([annotationFixture0]);

    // Ensure annotations are loaded
    await revision.getAnnotations();

    const intersectedAnnotation = revision.intersectAnnotations(raycaster);
    expect((intersectedAnnotation!.annotation.data as AnnotationsObjectDetection).label).toBe('bigger annotation');
  });

  test('Intersect prioritizes small annotations', async () => {
    const revision = createRevisionWithAnnotations(annotations);
    const revisionWithReversedAnnotations = createRevisionWithAnnotations([...annotations].reverse());

    const annotationObjects = await revision.getAnnotations();
    const reverseAnnotationObjects = await revisionWithReversedAnnotations.getAnnotations();

    const intersectedAnnotation = revision.intersectAnnotations(raycaster);
    const intersectedAnnotationReversed = revisionWithReversedAnnotations.intersectAnnotations(raycaster);

    expect((intersectedAnnotation!.annotation.data as AnnotationsObjectDetection).label).toBe('smaller annotation');
    expect((intersectedAnnotationReversed!.annotation.data as AnnotationsObjectDetection).label).toBe(
      'smaller annotation'
    );

    annotationObjects.forEach(a => a.dispose());
    reverseAnnotationObjects.forEach(a => a.dispose());
  });

  test('Intersect intersects DM mesh annotation', async () => {
    const revision = createRevisionWithDMAnnotations([dmAnnotationFixture]);
    await revision.getAnnotations();
    const intersectedAnnotation = revision.intersectAnnotations(raycaster);
    expect(intersectedAnnotation!.annotation.annotationIdentifier.externalId).toBe(
      dmAnnotationFixture.annotationIdentifier.externalId
    );
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

function createMockDataProvider<T extends DataSourceType>(
  annotations: T['image360AnnotationType'][]
): Image360Provider<T> {
  return new Mock<Image360Provider<T>>()
    .setup(p => p.getRelevant360ImageAnnotations(It.IsAny()))
    .returnsAsync(annotations)
    .object();
}

function createRevisionWithDMAnnotations(
  annotations: DMDataSourceType['image360AnnotationType'][]
): Image360RevisionEntity<DMDataSourceType> {
  const imageDescriptor: Image360Descriptor<DMDataSourceType> = {
    id: { externalId: 'someDescriptorId', space: 'someSpace' },
    faceDescriptors: [{ fileId: 1, face: 'front', mimeType: 'image/jpeg' }]
  };
  return new Image360RevisionEntity<DMDataSourceType>(
    createMockDataProvider(annotations),
    imageDescriptor,
    createImage360VisualizationBox(),
    new Image360AnnotationFilter({})
  );
}

function createRevisionWithAnnotations(annotations: AnnotationModel[]): Image360RevisionEntity<ClassicDataSourceType> {
  const imageDescriptor: Image360Descriptor<ClassicDataSourceType> = {
    id: 'someDescriptorId',
    faceDescriptors: [{ fileId: 1, face: 'front', mimeType: 'image/jpeg' }]
  };

  return new Image360RevisionEntity<ClassicDataSourceType>(
    createMockDataProvider(annotations),
    imageDescriptor,
    createImage360VisualizationBox(),
    new Image360AnnotationFilter({})
  );
}

function createImage360VisualizationBox() {
  return new Image360VisualizationBox(new Matrix4().identity(), new SceneHandler(), { deviceType: 'desktop' });
}
