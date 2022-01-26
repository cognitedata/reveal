import React from 'react';

import { screen } from '@testing-library/react';

import { testRenderer } from 'src/__test-utils/renderer';

import { AutoMLModelListItem } from 'src/modules/AutoML/Components/AutoMLModelListItem';
import { mockCogniteAutoMLModel } from 'src/__test-utils/fixtures/automlModels';

describe('AutoMLModelListItem', () => {
  const TestComponent = (props: any) => {
    return <AutoMLModelListItem {...props} />;
  };

  it('should render row with given AutoML model props', () => {
    const props = { model: mockCogniteAutoMLModel[0] };
    testRenderer(TestComponent, undefined, props);
    expect(screen.getByText('valve-detector')).toBeInTheDocument();
    expect(screen.getByText('2')).toBeInTheDocument();
    expect(screen.getByText('Completed')).toBeInTheDocument();
    expect(screen.getByTestId('automl-list-item').className).not.toContain(
      'active'
    );
  });

  it('should be active when job id and model id are similar', () => {
    const props = { model: mockCogniteAutoMLModel[0], selectedModelId: 2 };
    testRenderer(TestComponent, undefined, props);
    expect(screen.getByTestId('automl-list-item').className).toContain(
      'active'
    );
  });
});
