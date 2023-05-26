import React from 'react';

import { render, screen } from '@testing-library/react';
import '@testing-library/jest-dom';

import AuthWrapper from './AuthWrapper';

const renderChildren = <div>Sample app</div>;

function sleep(ms: number) {
  return new Promise<void>((resolve) => {
    setTimeout(() => resolve(), ms);
  });
}

describe('AuthWrapper', () => {
  it('Should always render the default cogs loader if no loading screen is passed', () => {
    render(
      <AuthWrapper login={() => sleep(100)}>{renderChildren}</AuthWrapper>
    );
    expect(screen.getByText('Loading')).toBeInTheDocument();
  });

  it('Should render the loading screen', () => {
    const testLoader = <div>Test loader</div>;
    render(
      <AuthWrapper login={() => sleep(100)} loadingScreen={testLoader}>
        {renderChildren}
      </AuthWrapper>
    );
    expect(screen.getByText('Test loader')).toBeInTheDocument();
    expect(screen.queryByText('Sample app')).not.toBeInTheDocument();
  });
});
