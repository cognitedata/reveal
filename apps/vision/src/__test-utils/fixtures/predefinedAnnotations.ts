import {
  LegacyAnnotation,
  LegacyAnnotationStatus,
} from 'src/api/annotation/legacy/legacyTypes';

export const predefinedAnnotations: LegacyAnnotation[] = [
  {
    annotatedResourceId: 0,
    annotatedResourceType: 'file',
    annotationType: 'CDF_ANNOTATION_TEMPLATE',
    createdTime: 1643950542440,
    data: {
      color: '#617817',
    },
    id: 1,
    lastUpdatedTime: 1643950542440,
    source: 'user',
    text: 'Shape',
    status: LegacyAnnotationStatus.Unhandled,
  },
  {
    annotatedResourceId: 0,
    annotatedResourceType: 'file',
    annotationType: 'CDF_ANNOTATION_TEMPLATE',
    createdTime: 1643950542440,
    data: {
      color: '#617817',
    },
    id: 2,
    lastUpdatedTime: 1643950542440,
    source: 'user',
    text: 'Person',
    status: LegacyAnnotationStatus.Unhandled,
  },
  {
    annotatedResourceId: 0,
    annotatedResourceType: 'file',
    annotationType: 'CDF_ANNOTATION_TEMPLATE',
    createdTime: 1630001300448,
    data: {
      keypoint: true,
      keypoints: [
        {
          caption: 'one',
          color: '#94D165',
          order: '1',
        },
        {
          caption: 'two',
          color: '#732050',
          order: '2',
        },
      ],
    },
    id: 3,
    lastUpdatedTime: 1630001300448,
    source: 'user',
    text: 'keypoint-collection-before-june-2022',
    status: LegacyAnnotationStatus.Unhandled,
  },
  {
    annotatedResourceId: 0,
    annotatedResourceType: 'file',
    annotationType: 'CDF_ANNOTATION_TEMPLATE',
    createdTime: 1655969957816,
    data: {
      color: '#79f2eb',
      keypoint: true,
      keypoints: [
        {
          caption: 'one',
          color: '#79f2eb',
          order: '1',
        },
        {
          caption: 'two',
          color: '#79f2eb',
          order: '2',
        },
      ],
    },
    id: 4,
    lastUpdatedTime: 1655969957816,
    source: 'user',
    text: 'keypoint-collection-after-june-2022',
    status: LegacyAnnotationStatus.Unhandled,
  },
];
