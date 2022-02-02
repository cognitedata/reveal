import { VisionAPIType } from 'src/api/types';

export const mockJobsList = [
  {
    type: VisionAPIType.OCR,
    createdTime: 1643352030229,
    items: [
      {
        fileId: 1,
      },
      {
        fileId: 2,
      },
    ],
    jobId: 1,
    status: 'Queued',
    statusTime: 1643352030229,
    useCache: true,
  },
  {
    type: VisionAPIType.TagDetection,
    assetSubtreeIds: [547950361720898],
    createdTime: 1643352030263,
    items: [
      {
        fileId: 1,
      },
      {
        fileId: 2,
      },
    ],
    jobId: 2,
    partialMatch: true,
    status: 'Queued',
    statusTime: 1643352030263,
    useCache: true,
  },
  {
    type: VisionAPIType.ObjectDetection,
    createdTime: 1643352030195,
    items: [
      {
        fileId: 1,
      },
      {
        fileId: 2,
      },
    ],
    jobId: 3,
    status: 'Queued',
    statusTime: 1643352030195,
    threshold: 0.8,
  },
  {
    type: VisionAPIType.ObjectDetection,
    createdTime: 1643352030195,
    jobId: 3,
    startTime: 1643352030660,
    status: 'Running',
    statusTime: 1643352037495,
  },
  {
    type: VisionAPIType.OCR,
    createdTime: 1643352030229,
    jobId: 1,
    startTime: 1643352032208,
    status: 'Running',
    statusTime: 1643352037601,
  },
  {
    type: VisionAPIType.TagDetection,
    createdTime: 1643352030263,
    jobId: 2,
    startTime: 1643352031030,
    status: 'Running',
    statusTime: 1643352037444,
  },
  {
    type: VisionAPIType.ObjectDetection,
    createdTime: 1643352030195,
    items: [
      {
        annotations: [],
        fileId: 1,
        height: 2448,
        width: 3264,
      },
      {
        annotations: [
          {
            confidence: 0.8164100050926208,
            region: {
              shape: 'rectangle',
              vertices: [
                {
                  x: 0.3443277180194855,
                  y: 0.07562699913978577,
                },
                {
                  x: 0.5155458450317383,
                  y: 0.6282840967178345,
                },
              ],
            },
            text: 'person',
          },
        ],
        fileId: 2,
        height: 1056,
        width: 1881,
      },
    ],
    jobId: 3,
    startTime: 1643352030660,
    status: 'Completed',
    statusTime: 1643352041998,
    threshold: 0.8,
  },
  {
    type: VisionAPIType.OCR,
    createdTime: 1643352030229,
    items: [
      {
        annotations: [
          {
            confidence: 1.0,
            region: {
              shape: 'rectangle',
              vertices: [
                {
                  x: 0.050551470588235295,
                  y: 0.4297385620915033,
                },
                {
                  x: 0.22732843137254902,
                  y: 0.47303921568627455,
                },
              ],
            },
            text: '80-GK-130A-S01',
          },
          {
            confidence: 1.0,
            region: {
              shape: 'rectangle',
              vertices: [
                {
                  x: 0.051470588235294115,
                  y: 0.4791666666666667,
                },
                {
                  x: 0.12714460784313725,
                  y: 0.5122549019607844,
                },
              ],
            },
            text: 'Emergency',
          },
        ],
        fileId: 1,
        height: 2448,
        width: 3264,
      },
      {
        annotations: [],
        fileId: 2,
        height: 1056,
        width: 1881,
      },
    ],
    jobId: 1,
    startTime: 1643352032208,
    status: 'Completed',
    statusTime: 1643352069656,
    useCache: true,
  },
  {
    type: VisionAPIType.TagDetection,
    assetSubtreeIds: [547950361720898],
    createdTime: 1643352030263,
    items: [
      {
        annotations: [
          {
            assetIds: [547950361720898],
            confidence: 1.0,
            region: {
              shape: 'rectangle',
              vertices: [
                {
                  x: 0.8002450980392157,
                  y: 0.36887254901960786,
                },
                {
                  x: 0.8477328431372549,
                  y: 0.39419934640522875,
                },
              ],
            },
            text: '80-6K-134-T01',
          },
          {
            assetIds: [547950361720898],
            confidence: 0.25,
            region: {
              shape: 'rectangle',
              vertices: [
                {
                  x: 0.7993259803921569,
                  y: 0.4048202614379085,
                },
                {
                  x: 0.8462009803921569,
                  y: 0.4276960784313726,
                },
              ],
            },
            text: '80-6K-134-T01',
          },
        ],
        fileId: 1,
        height: 2448,
        width: 3264,
      },
      {
        annotations: [],
        fileId: 2,
        height: 1056,
        width: 1881,
      },
    ],
    jobId: 2,
    partialMatch: true,
    startTime: 1643352031030,
    status: 'Completed',
    statusTime: 1643352068278,
    useCache: true,
  },
];
