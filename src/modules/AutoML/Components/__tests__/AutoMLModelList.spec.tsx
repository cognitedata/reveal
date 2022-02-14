import React from 'react';

import { screen } from '@testing-library/react';

import { testRenderer } from 'src/__test-utils/renderer';

import { AutoMLModelList } from 'src/modules/AutoML/Components/AutoMLModelList';

import { mockCogniteAutoMLModelList } from 'src/__test-utils/fixtures/automlModels';
import { AutoMLModel } from 'src/api/autoML/types';

describe('AutoMLModelList', () => {
  const TestComponent = (props: any) => {
    return <AutoMLModelList {...props} />;
  };

  it('should render loading page when models are yet to be fetched and then message when no models found', async () => {
    const props = { onRowClick: () => {}, models: [] };
    testRenderer(TestComponent, undefined, props);

    expect(screen.queryByTestId('loading-animation-icon')).toBeNull();
    expect(screen.queryByTestId('no-model-msg')).toBeInTheDocument();
  });

  it('should render model list', async () => {
    const props = {
      models: mockCogniteAutoMLModelList as AutoMLModel[],
      onRowClick: () => {},
    };
    testRenderer(TestComponent, undefined, props);

    expect(screen.queryByTestId('loading-animation-icon')).toBeNull();
    expect(screen.queryByTestId('no-model-msg')).toBeNull();

    mockCogniteAutoMLModelList.forEach((item) => {
      expect(screen.getByText(item.jobId)).toBeInTheDocument();
      expect(
        screen.getByText(item.name || 'Untitled model')
      ).toBeInTheDocument();
    });
  });
});
