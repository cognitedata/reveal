import React from 'react';

import { screen, waitFor } from '@testing-library/react';
import { testRenderer } from 'src/__test-utils/renderer';
import { AutoMLModelPage } from 'src/modules/AutoML/Components/AutoMLPage/AutoMLModelPage';
import { AutoMLAPI } from 'src/api/autoML/AutoMLAPI';
import { mockCogniteAutoMLModel } from 'src/__test-utils/fixtures/automlModels';
import { AutoMLTrainingJob } from 'src/api/autoML/types';

jest.mock('src/api/autoML/AutoMLAPI', () => ({
  AutoMLAPI: {
    getAutoMLModel: jest.fn(),
  },
}));

describe('AutoMLModelPage', () => {
  const TestComponent = (props: any) => {
    return <AutoMLModelPage {...props} />;
  };

  it('should render message when no models selected', async () => {
    AutoMLAPI.getAutoMLModel = () =>
      Promise.resolve(mockCogniteAutoMLModel[0] as AutoMLTrainingJob);
    testRenderer(TestComponent, undefined, undefined);

    expect(screen.queryByTestId('model-page-loading')).toBeNull();
    expect(screen.queryByTestId('model-page-placeholder')).toBeInTheDocument();

    await waitFor(() => {
      expect(screen.queryByTestId('model-page-loading')).toBeNull();
      expect(
        screen.queryByTestId('model-page-placeholder')
      ).toBeInTheDocument();
    });
  });

  it('should render loading state when model id and selectedModelId are different', async () => {
    const props = { selectedModelId: 2 };
    AutoMLAPI.getAutoMLModel = () =>
      Promise.resolve(mockCogniteAutoMLModel[0] as AutoMLTrainingJob);
    testRenderer(TestComponent, undefined, props);

    await waitFor(() => {
      expect(screen.queryByTestId('model-page-loading')).toBeInTheDocument();
      expect(screen.queryByTestId('model-page-placeholder')).toBeNull();
    });
  });

  it('should render model page', async () => {
    const props = { selectedModelId: 1 };
    AutoMLAPI.getAutoMLModel = () =>
      Promise.resolve(mockCogniteAutoMLModel[0] as AutoMLTrainingJob);
    testRenderer(TestComponent, undefined, props);

    await waitFor(() => {
      expect(screen.queryByTestId('model-page-loading')).toBeNull();
      expect(screen.queryByTestId('model-page-placeholder')).toBeNull();
      expect(screen.queryByText('Model information')).toBeInTheDocument();
    });
  });
});
