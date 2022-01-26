import React from 'react';

import { screen } from '@testing-library/react';

import { testRenderer } from 'src/__test-utils/renderer';

import { AutoMLModelNameBadge } from 'src/modules/AutoML/Components/AutoMLModelNameBadge';

describe('AutoMLModelNameBadge', () => {
  const TestComponent = (props: any) => {
    return <AutoMLModelNameBadge {...props} />;
  };

  it('should render badge with placeholder text', () => {
    testRenderer(TestComponent);
    expect(screen.getByText('Untitled model')).toBeInTheDocument();
    expect(
      screen.getByText('Untitled model').closest('button')
    ).not.toBeDisabled();
  });

  it('should render badge with given name', () => {
    const props = {
      name: 'model name',
      disabled: true,
    };
    testRenderer(TestComponent, undefined, props);
    expect(screen.getByText('model name')).toBeInTheDocument();
    expect(screen.getByText('model name').closest('button')).toBeDisabled();
  });
});
