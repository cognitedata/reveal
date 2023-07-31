import * as React from 'react';

import { screen } from '@testing-library/react';

import { testRenderer } from '__test-utils/renderer';

import { NoUnmountShowHide, NoUnmountShowHideProps } from './NoUnmountShowHide';

const TestComponent: React.FC<NoUnmountShowHideProps> = ({ show }) => (
  <NoUnmountShowHide show={show}>TestText</NoUnmountShowHide>
);

describe('NoUnmountShowHide', () => {
  const testInit = (props: NoUnmountShowHideProps) =>
    testRenderer(TestComponent, undefined, props);

  it('should show its children when `show` is set to `true`', () => {
    testInit({ show: true });
    expect(screen.getByText('TestText')).toBeVisible();
  });

  it('should hide its children when `show` is set to `false`', () => {
    testInit({ show: false });
    expect(screen.getByText('TestText')).not.toBeVisible();
  });
});
