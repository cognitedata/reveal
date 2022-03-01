import { ListResponse } from '@cognite/sdk';
import { DocumentsClassifier as Classifier } from '@cognite/sdk-playground';

export const fixtureClassifier = {
  list: () => {
    return {
      items: [
        {
          projectId: 4419889558688767,
          name: 'name',
          createdAt: 1627990050559,
          status: 'failed',
          active: false,
          id: 6043598694832969,
        },
        {
          projectId: 4419889558688767,
          name: 'name',
          createdAt: 1628072920221,
          status: 'training',
          active: false,
          id: 6994079749032633,
        },
        {
          projectId: 4419889558688767,
          name: 'Document classifier',
          createdAt: 1634810447158,
          status: 'finished',
          active: false,
          trainingSetSize: 256,
          id: 8108566805960597,
          metrics: {
            precision: 0.8466469428007889,
            recall: 0.7307692307692307,
            f1Score: 0.7179273815429421,
            confusionMatrix: [
              [11, 0, 0, 0, 0, 0, 0],
              [1, 4, 0, 0, 0, 3, 4],
              [0, 0, 7, 0, 0, 0, 5],
              [0, 0, 0, 0, 0, 0, 1],
              [0, 0, 0, 0, 0, 0, 0],
              [0, 0, 0, 0, 0, 10, 0],
              [0, 0, 0, 0, 0, 0, 6],
            ],
            labels: [
              'PID',
              'CORE_DESCRIPTION',
              'RISK_ASSESSMENT',
              'FINAL_WELL_REPORT',
              'APA_APPLICATION',
              'SCIENTIFIC_ARTICLE',
              'Unknown',
            ],
          },
        },
        {
          projectId: 4419889558688767,
          name: 'Document Type',
          createdAt: 1637155144564,
          status: 'finished',
          active: true,
          trainingSetSize: 58,
          id: 1481985721193584,
          metrics: {
            precision: 0.8402777777777777,
            recall: 0.9166666666666666,
            f1Score: 0.8768115942028986,
            confusionMatrix: [
              [0, 1, 0],
              [0, 11, 0],
              [0, 0, 0],
            ],
            labels: ['FINAL_WELL_REPORT', 'CORE_DESCRIPTION', 'Unknown'],
          },
        },
      ],
    } as ListResponse<Classifier[]>;
  },
  one: () =>
    ({
      projectId: 4419889558688767,
      name: 'Document classifier',
      createdAt: 1634810447158,
      status: 'finished',
      active: false,
      trainingSetSize: 256,
      id: 8108566805960597,
      metrics: {
        precision: 0.8466469428007889,
        recall: 0.7307692307692307,
        f1Score: 0.7179273815429421,
        confusionMatrix: [
          [11, 0, 0, 0, 0, 0, 0],
          [1, 4, 0, 0, 0, 3, 4],
          [0, 0, 7, 0, 0, 0, 5],
          [0, 0, 0, 0, 0, 0, 1],
          [0, 0, 0, 0, 0, 0, 0],
          [0, 0, 0, 0, 0, 10, 0],
          [0, 0, 0, 0, 0, 0, 6],
        ],
        labels: [
          'PID',
          'CORE_DESCRIPTION',
          'RISK_ASSESSMENT',
          'FINAL_WELL_REPORT',
          'APA_APPLICATION',
          'SCIENTIFIC_ARTICLE',
          'Unknown',
        ],
      },
    } as Classifier),
};
