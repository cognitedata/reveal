import type {
  CoreDmImage360Annotation,
  ImageAssetLinkAnnotationInfo,
  ImageInstanceLinkAnnotationInfo
} from '@cognite/reveal';
import { Vector3 } from 'three';

export const classic360AnnotationFixture: ImageAssetLinkAnnotationInfo =
  createClassic360AnnotationMock({ annotationId: 123, fileId: 1234, assetId: 3449 });

export function createClassic360AnnotationMock(params?: {
  annotationId?: number;
  fileId?: number;
  assetId?: number;
}): ImageAssetLinkAnnotationInfo {
  return {
    id: params?.annotationId ?? Math.random(),
    data: {
      assetRef: { id: params?.assetId ?? Math.random() },
      text: '',
      textRegion: { xMax: 1, xMin: 0, yMax: 1, yMin: 0 },
      objectRegion: {
        polygon: {
          vertices: [
            { x: 0, y: 0 },
            { x: 0, y: 1 },
            { x: 1, y: 1 },
            { x: 1, y: 0 }
          ]
        }
      }
    },
    createdTime: new Date('2025-06-01T12:00:00Z'),
    lastUpdatedTime: new Date('2025-06-01T12:00:00Z'),
    status: 'approved',
    annotationType: 'images.AssetLink',
    annotatedResourceId: params?.fileId ?? Math.random(),
    annotatedResourceType: 'file',
    creatingApp: 'test',
    creatingAppVersion: '0',
    creatingUser: 'dummy'
  };
}

export const hybrid360AnnotationFixture: ImageInstanceLinkAnnotationInfo = {
  id: 456,
  data: {
    instanceRef: {
      externalId: 'instanceId', space: 'space0',
      instanceType: 'node',
      sources: []
    },
    text: 'Hybrid annotation',
    textRegion: { xMax: 0.5, xMin: 0.1, yMax: 0.5, yMin: 0.1 },
    objectRegion: {
      polygon: {
        vertices: [
          { x: 0.1, y: 0.1 },
          { x: 0.1, y: 0.4 },
          { x: 0.4, y: 0.4 },
          { x: 0.4, y: 0.1 }
        ]
      }
    }
  },
  createdTime: new Date('2025-06-01T12:00:00Z'),
  lastUpdatedTime: new Date('2025-06-01T12:00:00Z'),
  status: 'approved',
  annotationType: 'image.InstanceLink',
  annotatedResourceId: 789,
  annotatedResourceType: 'file',
  creatingApp: 'test',
  creatingAppVersion: '0',
  creatingUser: 'dummy'
};

export const coreDm360AnnotationFixture: CoreDmImage360Annotation = {
  sourceType: 'dm',
  annotationIdentifier: { externalId: 'image360AnnotationId', space: 'space0' },
  assetRef: { externalId: 'assetId', space: 'space0' },
  polygon: [new Vector3(1, 0, 0), new Vector3(0, 1, 0), new Vector3(0, 0, 1)],
  status: 'approved',
  connectedImageId: { externalId: 'imageId', space: 'space0' }
};
