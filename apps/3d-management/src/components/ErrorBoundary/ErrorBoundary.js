import React from 'react';
import PropTypes from 'prop-types';
import { Metrics } from '@cognite/metrics';
import * as Sentry from '@sentry/browser';
import { Button } from '@cognite/cogs.js';

const propTypes = {
  children: PropTypes.node.isRequired,
};

const defaultProps = {};

class ErrorBoundary extends React.Component {
  state = { hasError: false };

  metrics = Metrics.create('ErrorBoundary');

  componentDidCatch(error, errorInfo) {
    // Display fallback UI
    this.setState({ hasError: true });
    // log the error to an error reporting service
    Sentry.configureScope((scope) => {
      Object.keys(errorInfo).forEach((key) => {
        scope.setExtra(key, errorInfo[key]);
      });
    });
    Sentry.captureException(error);
  }

  render() {
    if (this.state.hasError) {
      // You can render any custom fallback UI
      return (
        <div>
          <h1>Something went wrong.</h1>
          <Button type="primary" onClick={() => Sentry.showReportDialog()}>
            Report feedback
          </Button>
        </div>
      );
    }
    return this.props.children;
  }
}

ErrorBoundary.propTypes = propTypes;
ErrorBoundary.defaultProps = defaultProps;

export default ErrorBoundary;
