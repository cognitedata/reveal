import { Classifier } from '@cognite/sdk-playground';
import React from 'react';
import { MatrixTable } from './components';

interface Props {}

export const ReviewModel: React.FC<Props> = () => {
  const test: Classifier[] = [
    {
      projectId: 123,
      name: 'name',
      createdAt: 1628080015804,
      status: 'finished',
      active: true,
      id: 4784470505715878,
      metrics: {
        precision: 0.9450549450549451,
        recall: 0.9230769230769231,
        f1Score: 0.9209401709401709,
        confusionMatrix: [
          [7, 0, 0, 0, 0, 0, 4],
          [1, 3, 1, 0, 0, 0, 0],
          [0, 0, 10, 0, 0, 0, 0],
          [0, 0, 0, 10, 0, 0, 0],
          [0, 0, 0, 0, 0, 0, 0],
          [0, 0, 0, 0, 0, 11, 0],
          [0, 0, 0, 0, 0, 0, 10],
          [0, 0, 0, 0, 0, 0, 10],
        ],
        labels: [
          'CORE_DESCRIPTION',
          'APA_APPLICATION',
          'PID',
          'SCIENTIFIC_ARTICLE',
          'FINAL_WELL_REPORT',
          'RISK_ASSESSMENT',
          'Unknown',
        ],
      },
    },
  ];

  return <MatrixTable classifier={test[0]} />;
};
