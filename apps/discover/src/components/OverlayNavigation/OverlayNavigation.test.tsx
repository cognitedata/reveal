import * as React from 'react';

import { screen } from '@testing-library/react';

import { testRenderer } from '__test-utils/renderer';

import { OverlayNavigation, OverlayNavigationProps } from './OverlayNavigation';

const TestComponent: React.FC<OverlayNavigationProps> = ({ mount }) => (
  <OverlayNavigation mount={mount}>TestText</OverlayNavigation>
);

describe('OverlayNavigation', () => {
  const testInit = (props: OverlayNavigationProps) =>
    testRenderer(TestComponent, undefined, props);

  it('should show render children when `isVisible` is set to `true`', () => {
    testInit({ mount: true });
    expect(screen.getByText('TestText')).toBeInTheDocument();
  });

  it('should not render its children when `isVisible` is set to `false`', () => {
    testInit({ mount: false });
    expect(screen.queryByText('TestText')).not.toBeInTheDocument();
  });
});
