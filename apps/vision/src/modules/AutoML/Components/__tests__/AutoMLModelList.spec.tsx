import React from 'react';

import { screen } from '@testing-library/react';

import { mockCogniteAutoMLModelList } from '../../../../__test-utils/fixtures/automlModels';
import { testRenderer } from '../../../../__test-utils/renderer';
import { AutoMLModelCore } from '../../../../api/vision/autoML/types';
import { AutoMLModelList } from '../AutoMLModelList';

describe('AutoMLModelList', () => {
  const TestComponent = (props: any) => {
    return <AutoMLModelList {...props} />;
  };

  it('should render loading page when models are yet to be fetched and then message when no models found', async () => {
    const props = { onRowClick: () => {}, modelList: [] };
    testRenderer(TestComponent, undefined, props);

    expect(screen.queryByTestId('loading-animation-icon')).toBeNull();
    expect(screen.getByTestId('no-model-msg')).toBeInTheDocument();
  });

  it('should render model list', async () => {
    const props = {
      modelList: mockCogniteAutoMLModelList as AutoMLModelCore[],
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
