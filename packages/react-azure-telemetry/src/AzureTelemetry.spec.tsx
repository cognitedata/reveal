import React from 'react';
import { render, screen } from '@testing-library/react';
import { Router } from 'react-router';
import { createBrowserHistory } from 'history';
import { AzureTelemetryProvider } from './AzureTelemetry';

describe('AzureTelemetry', () => {
  it('renders the right content', () => {
    const Test: React.FC = () => {
      const [history] = React.useState(() => createBrowserHistory());

      return (
        <Router history={history}>
          <AzureTelemetryProvider>
            <div>test content</div>
          </AzureTelemetryProvider>
        </Router>
      );
    };

    render(<Test />);
    expect(screen.getByText('test content')).toBeInTheDocument();
  });
});
