import React from 'react';

import { screen } from '@testing-library/react';

import { mockCogniteAutoMLModel } from '../../../../../__test-utils/fixtures/automlModels';
import { testRenderer } from '../../../../../__test-utils/renderer';
import { AutoMLTrainingJob } from '../../../../../api/vision/autoML/types';
import { AutoMLModelPage } from '../AutoMLModelPage';

jest.mock('@vision/hooks/useUserCapabilities', () => ({
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
    expect(screen.getByTestId('model-page-placeholder')).toBeInTheDocument();
  });

  it('should render loading state when model is loading', async () => {
    const props = {
      isLoadingJob: true,
    };

    testRenderer(TestComponent, undefined, props);
    expect(screen.getByTestId('model-page-loading')).toBeInTheDocument();
    expect(screen.queryByTestId('model-page-placeholder')).toBeNull();
  });

  it('should render model page', async () => {
    const props = { model: mockCogniteAutoMLModel[0] as AutoMLTrainingJob };

    testRenderer(TestComponent, undefined, props);
    expect(screen.queryByTestId('model-page-loading')).toBeNull();
    expect(screen.queryByTestId('model-page-placeholder')).toBeNull();
    expect(screen.getByText('Model information')).toBeInTheDocument();
  });
});
