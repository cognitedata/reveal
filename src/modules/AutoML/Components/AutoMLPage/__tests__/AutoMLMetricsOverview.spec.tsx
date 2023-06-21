import React from 'react';

import { screen } from '@testing-library/react';

import { testRenderer } from 'src/__test-utils/renderer';

import {
  AutoMLMetricsOverview,
  formatModelType,
  getPrecisionAndRecall,
} from 'src/modules/AutoML/Components/AutoMLPage/AutoMLMetricsOverview';
import { mockCogniteAutoMLModel } from 'src/__test-utils/fixtures/automlModels';
import { dateformat, getDateDiff } from 'src/utils/DateUtils';
import { AutoMLModelType } from 'src/api/vision/autoML/types';

describe('AutoMLMetricsOverview', () => {
  const TestComponent = (props: any) => {
    return <AutoMLMetricsOverview {...props} />;
  };

  it('should render performance data when job status is completed', () => {
    const props = { model: mockCogniteAutoMLModel[0] };
    testRenderer(TestComponent, undefined, props);

    expect(screen.getByText('Score threshold')).toBeInTheDocument();
    expect(screen.getByText('Precision')).toBeInTheDocument();
    expect(screen.getByText('Recall')).toBeInTheDocument();

    expect(
      screen.getByText(mockCogniteAutoMLModel[0].status)
    ).toBeInTheDocument();
    expect(
      screen.getByText(
        formatModelType(mockCogniteAutoMLModel[0].modelType as AutoMLModelType)
      )
    ).toBeInTheDocument();
    expect(
      screen.getByText(
        dateformat(new Date(mockCogniteAutoMLModel[0].createdTime))
      )
    ).toBeInTheDocument();
    expect(
      screen.getByText(
        getDateDiff(
          new Date(mockCogniteAutoMLModel[0].startTime),
          new Date(mockCogniteAutoMLModel[0].statusTime)
        )
      )
    ).toBeInTheDocument();
  });

  it('should render message in performance box when job is not completed', () => {
    const props = { model: mockCogniteAutoMLModel[1] };
    testRenderer(TestComponent, undefined, props);
    expect(
      screen.getByText('Performance data not available')
    ).toBeInTheDocument();
  });
});

describe('getPrecisionAndRecall', () => {
  it('should return zeros when metrics is undefined', () => {
    expect(getPrecisionAndRecall(0.5, undefined)).toStrictEqual({
      confidenceThreshold: 0.0,
      precision: 0,
      recall: 0,
      f1score: 0,
    });
  });

  it('should return zeros when metrics array is empty', () => {
    expect(getPrecisionAndRecall(0.5, [])).toStrictEqual({
      confidenceThreshold: 0.0,
      precision: 0,
      recall: 0,
      f1score: 0,
    });
  });
  it('should return closest item', () => {
    const metrics = [
      {
        confidenceThreshold: 0.0,
        precision: 0,
        recall: 0,
        f1score: 0,
      },
      {
        confidenceThreshold: 0.45,
        precision: 1,
        recall: 1,
        f1score: 1,
      },
    ];
    expect(getPrecisionAndRecall(0.5, metrics)).toBe(metrics[1]);
  });
});
