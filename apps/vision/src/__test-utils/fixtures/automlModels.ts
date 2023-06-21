export const mockCogniteAutoMLModelList = [
  {
    jobId: 7416476647727177,
    modelType: 'classification',
    name: 'corrosion-detector',
    status: 'Completed',
  },
  {
    jobId: 1392294477068694,
    modelType: 'objectdetection',
    name: 'gauge-reader',
    status: 'Completed',
  },
  {
    jobId: 3451934891846151,
    modelType: 'classification',
    name: '',
    status: 'Completed',
  },
];

export const mockCogniteAutoMLTrainingJob = [
  {
    name: 'valve-detector',
    jobId: 2,
    modelType: 'objectdetection',
    status: 'Completed',
    createdTime: 1639502118758,
    startTime: 1639502120371,
    statusTime: 1639511202313,
    items: [
      {
        fileId: 10,
      },
      {
        fileExternalId: 'image1.png',
      },
    ],
  },

  {
    name: 'gauge-reader',
    jobId: 1,
    modelType: 'classification',
    status: 'Completed',
    createdTime: 1639436895522,
    startTime: 1639436896998,
    statusTime: 1639445061156,
    items: [
      {
        fileId: 20,
      },
      {
        fileExternalId: 'image2.png',
      },
    ],
  },
];

export const mockCogniteAutoMLModel = [
  {
    name: 'valve-detector',
    jobId: 1,
    modelType: 'objectdetection',
    status: 'Completed',
    createdTime: 1639502118758,
    startTime: 1639502120371,
    statusTime: 1639511202313,
    modelUrl: '',
    modelEvaluation: {
      meanAveragePrecision: 0.9980815,
      metrics: [
        {
          confidenceThreshold: 0.0,
          f1score: 0.6666666666666666,
          precision: 0.5,
          recall: 1.0,
        },
        {
          confidenceThreshold: 0.1,
          f1score: 0.9779058545576231,
          precision: 0.96219283,
          recall: 0.9941406,
        },
        {
          confidenceThreshold: 0.2,
          f1score: 0.9816425061209363,
          precision: 0.9713193,
          recall: 0.9921875,
        },
        {
          confidenceThreshold: 0.3,
          f1score: 0.9815354749678179,
          precision: 0.9767892,
          recall: 0.9863281,
        },
        {
          confidenceThreshold: 0.4,
          f1score: 0.9814995248637326,
          precision: 0.9786408,
          recall: 0.984375,
        },
        {
          confidenceThreshold: 0.5,
          f1score: 0.9795121926805472,
          precision: 0.9785575,
          recall: 0.98046875,
        },
        {
          confidenceThreshold: 0.6,
          f1score: 0.9813907769577367,
          precision: 0.9842829,
          recall: 0.9785156,
        },
        {
          confidenceThreshold: 0.7,
          f1score: 0.9813542719183406,
          precision: 0.9861933,
          recall: 0.9765625,
        },
        {
          confidenceThreshold: 0.8,
          f1score: 0.981243813489513,
          precision: 0.99201596,
          recall: 0.9707031,
        },
        {
          confidenceThreshold: 0.9,
          f1score: 0.9771598837630135,
          precision: 0.9939394,
          recall: 0.9609375,
        },
        {
          confidenceThreshold: 1.0,
          f1score: 0.019342359767891684,
          precision: 1.0,
          recall: 0.009765625,
        },
      ],
    },
  },

  {
    name: 'gauge-reader',
    jobId: 2,
    modelType: 'classification',
    status: 'Running',
    createdTime: 1639436895522,
    startTime: 1639436896998,
    statusTime: 1639445061156,
    modelUrl: '',
    modelEvaluation: {
      meanAveragePrecision: 0.9990043,
      metrics: [
        {
          confidenceThreshold: 0.0,
          f1score: 0.6666666666666666,
          precision: 0.5,
          recall: 1.0,
        },
        {
          confidenceThreshold: 0.1,
          f1score: 0.9719222537720005,
          precision: 0.94736844,
          recall: 0.9977827,
        },
        {
          confidenceThreshold: 0.2,
          f1score: 0.9944751218414577,
          precision: 0.9911894,
          recall: 0.9977827,
        },
        {
          confidenceThreshold: 0.3,
          f1score: 0.9966777527319416,
          precision: 0.99557525,
          recall: 0.9977827,
        },
        {
          confidenceThreshold: 0.4,
          f1score: 0.9966777527319416,
          precision: 0.99557525,
          recall: 0.9977827,
        },
        {
          confidenceThreshold: 0.5,
          f1score: 0.9977827,
          precision: 0.9977827,
          recall: 0.9977827,
        },
        {
          confidenceThreshold: 0.6,
          f1score: 0.9966703522794379,
          precision: 0.99777776,
          recall: 0.9955654,
        },
        {
          confidenceThreshold: 0.7,
          f1score: 0.9966703522794379,
          precision: 0.99777776,
          recall: 0.9955654,
        },
        {
          confidenceThreshold: 0.8,
          f1score: 0.9955555336812346,
          precision: 0.9977728,
          recall: 0.9933481,
        },
        {
          confidenceThreshold: 0.9,
          f1score: 0.9750566787619356,
          precision: 0.9976798,
          recall: 0.9534368,
        },
        { confidenceThreshold: 1.0, f1score: 0.0, precision: 1.0, recall: 0.0 },
      ],
    },
  },
];
