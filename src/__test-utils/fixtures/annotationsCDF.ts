import { AnnotationModel } from '@cognite/sdk-playground';

export const invalidCDFAnnotation1: AnnotationModel = {
  id: 8482378845365,
  createdTime: new Date(2022, 1, 24),
  lastUpdatedTime: new Date(2022, 1, 24),
  status: 'suggested',
  annotatedResourceType: 'file',
  annotatedResourceId: 711494377822800,
  annotationType: 'invalid-annotation-type', // invalid
  creatingApp: 'annotation-migration-migrate-legacy-annotations',
  creatingAppVersion: '0.4.8',
  creatingUser: null,
  data: {
    confidence: 1,
    text: '84HU-1012A',
    textRegion: {
      xMax: 0.6850490196078431,
      xMin: 0.5555555555555556,
      yMax: 0.7417279411764706,
      yMin: 0.7098651960784313,
    },
  },
};

// images.TextRegion annotation type
export const sampleCDFAnnotation1: AnnotationModel = {
  id: 8482378845365,
  createdTime: new Date(2022, 1, 24),
  lastUpdatedTime: new Date(2022, 1, 24),
  status: 'suggested',
  annotatedResourceType: 'file',
  annotatedResourceId: 711494377822800,
  annotationType: 'images.TextRegion',
  creatingApp: 'annotation-migration-migrate-legacy-annotations',
  creatingAppVersion: '0.4.8',
  creatingUser: null,
  data: {
    confidence: 1,
    text: '84HU-1012A',
    textRegion: {
      xMax: 0.6850490196078431,
      xMin: 0.5555555555555556,
      yMax: 0.7417279411764706,
      yMin: 0.7098651960784313,
    },
  },
};

export const sampleCDFAnnotation2: AnnotationModel = {
  id: 8482378845366,
  createdTime: new Date(2022, 1, 24),
  lastUpdatedTime: new Date(2022, 1, 24),
  status: 'approved',
  annotatedResourceType: 'file',
  annotatedResourceId: 711494377822800,
  annotationType: 'images.TextRegion',
  creatingApp: 'annotation-migration-migrate-legacy-annotations',
  creatingAppVersion: '0.4.8',
  creatingUser: null,
  data: {
    confidence: 1,
    text: '82-EN-100A-07LIN2',
    textRegion: {
      xMax: 0.48743872549019607,
      xMin: 0.3955269607843137,
      yMax: 0.42728758169934644,
      yMin: 0.40645424836601307,
    },
  },
};

export const sampleCDFAnnotation3: AnnotationModel = {
  id: 8482378845367,
  createdTime: new Date(2022, 1, 24),
  lastUpdatedTime: new Date(2022, 1, 24),
  status: 'rejected',
  annotatedResourceType: 'file',
  annotatedResourceId: 711494377822800,
  annotationType: 'images.TextRegion',
  creatingApp: 'annotation-migration-migrate-legacy-annotations',
  creatingAppVersion: '0.4.8',
  creatingUser: null,
  data: {
    confidence: 1,
    text: '80-GK-130A-S01',
    textRegion: {
      xMax: 0.5003063725490196,
      xMin: 0.37683823529411764,
      yMax: 0.35171568627450983,
      yMin: 0.32516339869281047,
    },
  },
};

export const sampleCDFAnnotation4: AnnotationModel = {
  id: 84823788453658,
  createdTime: new Date(2022, 1, 24),
  lastUpdatedTime: new Date(2022, 1, 24),
  status: 'suggested',
  annotatedResourceType: 'file',
  annotatedResourceId: 711494377822800,
  annotationType: 'images.TextRegion',
  creatingApp: 'Fusion: Vision',
  creatingAppVersion: '0.4.8',
  creatingUser: null,
  data: {
    confidence: 1,
    text: '84HU-1012A',
    textRegion: {
      xMax: 0.6850490196078431,
      xMin: 0.5555555555555556,
      yMax: 0.7417279411764706,
      yMin: 0.7098651960784313,
    },
  },
};

// images.KeypointCollection annotation type
export const sampleCDFAnnotation5 = {
  // migrated keypoints don't have confidence
  id: 111918284059050,
  createdTime: new Date(2022, 1, 24),
  lastUpdatedTime: new Date(2022, 1, 24),
  status: 'approved',
  annotatedResourceType: 'file',
  annotatedResourceId: 711494377822800,
  annotationType: 'images.KeypointCollection',
  creatingApp: 'annotation-migration-migrate-legacy-annotations',
  creatingAppVersion: '0.4.8',
  creatingUser: null,
  data: {
    label: 'analog-gauge',
    keypoints: {
      center: {
        point: {
          x: 0.8429621848739496,
          y: 0.5777310924369748,
        },
      },
      start: {
        point: { x: 0.6271008403361344, y: 0.4138655462184874 },
      },
      stop: {
        point: { x: 0.8224789915966387, y: 0.3445378151260505 },
      },
      tip: {
        point: { x: 0.54359243697479, y: 0.24579831932773114 },
      },
    },
  },
};

export const sampleCDFAnnotation6 = {
  id: 111918284059051,
  createdTime: new Date(2022, 1, 24),
  lastUpdatedTime: new Date(2022, 1, 24),
  status: 'approved',
  annotatedResourceType: 'file',
  annotatedResourceId: 711494377822800,
  annotationType: 'images.KeypointCollection',
  creatingApp: 'annotation-migration-migrate-legacy-annotations',
  creatingAppVersion: '0.4.8',
  creatingUser: null,
  data: {
    confidence: 1,
    label: 'Triangle',
    keypoints: {
      'point 1': {
        confidence: 1,
        point: { x: 0.06288532675709002, y: 0.18988902589395806 },
      },
      'point 2': {
        confidence: 1,
        point: { x: 0.23581997533908755, y: 0.1960542540073983 },
      },
      'point 3': {
        confidence: 1,
        point: { x: 0.3800863131935882, y: 0.2281134401972873 },
      },
    },
  },
};

export const sampleCDFAnnotation7 = {
  id: 111918284059050,
  createdTime: new Date(2022, 1, 24),
  lastUpdatedTime: new Date(2022, 1, 24),
  status: 'approved',
  annotatedResourceType: 'file',
  annotatedResourceId: 711494377822800,
  annotationType: 'images.KeypointCollection',
  creatingApp: 'Fusion: Vision',
  creatingAppVersion: '0.4.8',
  creatingUser: null,
  data: {
    label: 'vision-k3',
    keypoints: {
      1: {
        confidence: 1,
        point: { x: 0.19882860665844637, y: 0.12453760789149199 },
      },
    },
  },
};

// images.ObjectDetection annotation type
export const sampleCDFAnnotation8: AnnotationModel = {
  id: 111918284059050,
  createdTime: new Date(2022, 1, 24),
  lastUpdatedTime: new Date(2022, 1, 24),
  status: 'approved',
  annotatedResourceType: 'file',
  annotatedResourceId: 711494377822800,
  annotationType: 'images.ObjectDetection',
  creatingApp: 'annotation-migration-migrate-legacy-annotations',
  creatingAppVersion: '0.4.8',
  creatingUser: null,
  data: {
    label: 'wind-turbine',
    boundingBox: {
      xMax: 0.2599789915966387,
      xMin: 0.10871848739495799,
      yMax: 0.573529411764706,
      yMin: 0.29621848739495804,
    },
  },
};

export const sampleCDFAnnotation9: AnnotationModel = {
  id: 111918284059050,
  createdTime: new Date(2022, 1, 24),
  lastUpdatedTime: new Date(2022, 1, 24),
  status: 'approved',
  annotatedResourceType: 'file',
  annotatedResourceId: 711494377822800,
  annotationType: 'images.ObjectDetection',
  creatingApp: 'annotation-migration-migrate-legacy-annotations',
  creatingAppVersion: '0.4.8',
  creatingUser: null,
  data: {
    label: 'wind-turbine',
    polygon: {
      vertices: [
        { x: 0.3812919463087248, y: 0.11577181208053691 },
        { x: 0.5939597315436241, y: 0.1040268456375839 },
        { x: 0.636744966442953, y: 0.3053691275167785 },
        { x: 0.3271812080536912, y: 0.27684563758389263 },
      ],
    },
  },
};

// images.AssetLink annotation type

export const sampleCDFAnnotation10: AnnotationModel = {
  id: 111918284059050,
  createdTime: new Date(2022, 1, 24),
  lastUpdatedTime: new Date(2022, 1, 24),
  status: 'approved',
  annotatedResourceType: 'file',
  annotatedResourceId: 711494377822800,
  annotationType: 'images.AssetLink',
  creatingApp: 'annotation-migration-migrate-legacy-annotations',
  creatingAppVersion: '0.4.8',
  creatingUser: null,
  data: {
    assetRef: { id: 2292812291744450 },
    confidence: 1,
    text: '80-GK-130A-S01',
    textRegion: {
      xMax: 0.5003063725490196,
      xMin: 0.37683823529411764,
      yMax: 0.3517156862745099,
      yMin: 0.32516339869281047,
    },
  },
};

export const sampleCDFAnnotations: AnnotationModel[] = [
  sampleCDFAnnotation1,
  sampleCDFAnnotation2,
  sampleCDFAnnotation3,
  sampleCDFAnnotation4,
  sampleCDFAnnotation5 as AnnotationModel,
  sampleCDFAnnotation6 as AnnotationModel,
  sampleCDFAnnotation7 as AnnotationModel,
  sampleCDFAnnotation8,
  sampleCDFAnnotation9,
  sampleCDFAnnotation10,
];
