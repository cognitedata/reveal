export const mockAnnotationList = [
  {
    annotatedResourceId: 1,
    annotatedResourceType: 'file',
    annotationType: 'vision/ocr',
    createdTime: 1641800457110,
    data: {
      confidence: 1,
    },
    id: 1,
    lastUpdatedTime: 1643642124399,
    region: {
      shape: 'rectangle',
      vertices: [
        {
          x: 0.6072303921568627,
          y: 0.3137254901960784,
        },
        {
          x: 0.7018995098039216,
          y: 0.33700980392156865,
        },
      ],
    },
    source: 'context_api',
    status: 'verified',
    text: 'One',
  },
  {
    annotatedResourceId: 2,
    annotatedResourceType: 'file',
    annotationType: 'vision/tagdetection',
    createdTime: 1643726203842,
    data: {
      confidence: 1,
    },
    id: 2,
    lastUpdatedTime: 1643726203842,
    linkedResourceExternalId: '24-VG-001',
    linkedResourceId: 763042240847683,
    linkedResourceType: 'asset',
    region: {
      shape: 'rectangle',
      vertices: [
        {
          x: 0.6072303921568627,
          y: 0.3137254901960784,
        },
        {
          x: 0.7018995098039216,
          y: 0.3370098039215687,
        },
      ],
    },
    source: 'context_api',
    status: 'unhandled',
    text: 'asset',
  },
  {
    annotatedResourceId: 1,
    annotatedResourceType: 'file',
    annotationType: 'vision/objectdetection',
    createdTime: 1648560229734,
    data: {
      keypoint: true,
      keypoints: [
        {
          caption: 'v1',
          color: '#88C6FA',
          order: '1',
        },
        {
          caption: 'v2',
          color: '#FE7B22',
          order: '2',
        },
      ],
    },
    id: 3,
    lastUpdatedTime: 1648560229734,
    region: {
      shape: 'points',
      vertices: [
        {
          x: 0.5070337620578779,
          y: 0.3183279742765273,
        },
        {
          x: 0.552250803858521,
          y: 0.35691318327974275,
        },
      ],
    },
    source: 'user',
    status: 'verified',
    text: 'Gauge',
  },
  {
    annotatedResourceId: 1,
    annotatedResourceType: 'file',
    annotationType: 'vision/objectdetection',
    createdTime: 1649242940252,
    data: {
      color: '#C21A79',
    },
    id: 4,
    lastUpdatedTime: 1649242940252,
    region: {
      shape: 'rectangle',
      vertices: [
        {
          x: 0.6417785234899328,
          y: 0.45805369127516776,
        },
        {
          x: 0.8041107382550334,
          y: 0.6090604026845637,
        },
      ],
    },
    source: 'user',
    status: 'verified',
    text: 'object',
  },
  {
    annotatedResourceId: 1,
    annotatedResourceType: 'file',
    annotationType: 'vision/objectdetection',
    createdTime: 1649246714441,
    data: {
      color: '#9749B1',
    },
    id: 5,
    lastUpdatedTime: 1649246714441,
    region: {
      shape: 'polygon',
      vertices: [
        {
          x: 0.11828859060402683,
          y: 0.40268456375838924,
        },
        {
          x: 0.19379194630872482,
          y: 0.19463087248322147,
        },
        {
          x: 0.4379194630872483,
          y: 0.46308724832214765,
        },
        {
          x: 0.22525167785234898,
          y: 0.6124161073825504,
        },
        {
          x: 0.07424496644295302,
          y: 0.552013422818792,
        },
      ],
    },
    source: 'user',
    status: 'verified',
    text: 'Polygon',
  },
];
