import React from 'react';

import { screen } from '@testing-library/react';
import { testRenderer } from 'src/__test-utils/renderer';
import { AutoMLModelPage } from 'src/modules/AutoML/Components/AutoMLPage/AutoMLModelPage';
import { mockCogniteAutoMLModel } from 'src/__test-utils/fixtures/automlModels';
import { AutoMLTrainingJob } from 'src/api/vision/autoML/types';

jest.mock('src/hooks/useUserCapabilities', () => ({
  useUserCapabilities: () => {
    return { data: true, isFetched: true };
  },
}));

describe('AutoMLModelPage', () => {
  const TestComponent = (props: any) => {
    return <AutoMLModelPage {...props} />;
  };

  it('should render message when no models selected', async () => {
    testRenderer(TestComponent, undefined, undefined);
    expect(screen.queryByTestId('model-page-loading')).toBeNull();
    expect(screen.queryByTestId('model-page-placeholder')).toBeInTheDocument();
  });

  it('should render loading state when model is loading', async () => {
    const props = {
      isLoadingJob: true,
    };

    testRenderer(TestComponent, undefined, props);
    expect(screen.queryByTestId('model-page-loading')).toBeInTheDocument();
    expect(screen.queryByTestId('model-page-placeholder')).toBeNull();
  });

  it('should render model page', async () => {
    const props = { model: mockCogniteAutoMLModel[0] as AutoMLTrainingJob };

    testRenderer(TestComponent, undefined, props);
    expect(screen.queryByTestId('model-page-loading')).toBeNull();
    expect(screen.queryByTestId('model-page-placeholder')).toBeNull();
    expect(screen.queryByText('Model information')).toBeInTheDocument();
  });
});
