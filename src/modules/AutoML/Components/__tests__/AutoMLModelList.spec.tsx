import React from 'react';

import { screen, waitFor } from '@testing-library/react';

import { testRenderer } from 'src/__test-utils/renderer';

import { AutoMLModelList } from 'src/modules/AutoML/Components/AutoMLModelList';

import { AutoMLAPI } from 'src/api/autoML/AutoMLAPI';
import { mockCogniteAutoMLModelList } from 'src/__test-utils/fixtures/automlModels';
import { AutoMLModel } from 'src/api/autoML/types';

jest.mock('src/api/autoML/AutoMLAPI', () => ({
  AutoMLAPI: {
    listAutoMLModels: jest.fn(),
  },
}));

describe('AutoMLModelList', () => {
  const TestComponent = (props: any) => {
    return <AutoMLModelList {...props} />;
  };

  it('should render loading page when models are yet to be fetched and then message when no models found', async () => {
    const props = { onRowClick: () => {} };
    AutoMLAPI.listAutoMLModels = () => Promise.resolve([]);
    testRenderer(TestComponent, undefined, props);

    expect(screen.getByTestId('loading-animation-icon')).toBeInTheDocument();
    expect(screen.queryByTestId('no-model-msg')).toBeNull();

    await waitFor(() => {
      expect(screen.queryByTestId('loading-animation-icon')).toBeNull();
      expect(screen.queryByTestId('no-model-msg')).toBeInTheDocument();
    });
  });

  it('should render model list', async () => {
    const props = { onRowClick: () => {} };
    AutoMLAPI.listAutoMLModels = () =>
      Promise.resolve(mockCogniteAutoMLModelList as AutoMLModel[]);
    testRenderer(TestComponent, undefined, props);

    expect(screen.getByTestId('loading-animation-icon')).toBeInTheDocument();
    expect(screen.queryByTestId('no-model-msg')).toBeNull();

    await waitFor(() => {
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
});
