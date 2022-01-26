import React from 'react';

import { screen } from '@testing-library/react';

import { testRenderer } from 'src/__test-utils/renderer';

import { AutoMLStatusBadge } from 'src/modules/AutoML/Components/AutoMLStatusBadge';
import { StatusColors } from 'src/constants/Colors';

describe('AutoMLStatusBadge', () => {
  const TestComponent = (props: any) => {
    return <AutoMLStatusBadge {...props} />;
  };

  it('should render badge with placeholder text', () => {
    testRenderer(TestComponent);
    expect(screen.getByText('Queued')).toBeInTheDocument();
    expect(screen.getByTestId('status-dot').style.background).toBe(
      StatusColors.queued
    );
  });

  it('should render badge with given Completed status', () => {
    const props = {
      status: 'Completed',
    };
    testRenderer(TestComponent, undefined, props);
    expect(screen.getByText('Completed')).toBeInTheDocument();
    expect(screen.getByTestId('status-dot').style.background).toBe(
      StatusColors.completed
    );
  });

  it('should render badge with given Running status', () => {
    const props = {
      status: 'Running',
    };
    testRenderer(TestComponent, undefined, props);
    expect(screen.getByText('Running')).toBeInTheDocument();
    expect(screen.getByTestId('status-dot').style.background).toBe(
      StatusColors.running
    );
  });

  it('should render badge with given Failed status', () => {
    const props = {
      status: 'Failed',
    };
    testRenderer(TestComponent, undefined, props);
    expect(screen.getByText('Failed')).toBeInTheDocument();
    expect(screen.getByTestId('status-dot').style.background).toBe(
      StatusColors.failed
    );
  });
});
