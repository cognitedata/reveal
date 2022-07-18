import React, { ErrorInfo } from 'react';
import { withTranslation, Trans, WithTranslation } from 'react-i18next';
import { Metrics } from '@cognite/metrics';
import { A, Button } from '@cognite/cogs.js';

import { reportException, ReportedError } from '../reportException';
import { ErrorPageContainer } from '../ErrorPage';

type State = {
  reportedError: ReportedError | null;
  hasError?: boolean;
};

type Props = WithTranslation & {
  children: React.ReactNode;
  // instanceId: string;
};

class ErrorBoundary extends React.Component<Props, State> {
  private readonly metrics = Metrics.create('ErrorBoundary');

  public readonly state: State = { reportedError: null };

  public static getDerivedStateFromError() {
    return { hasError: true };
  }

  public componentDidCatch(error: Error, errorInfo: ErrorInfo) {
    reportException(error, { stack: errorInfo.componentStack }).then(
      (reportedError) => {
        this.metrics.track('errorCaught', {
          errorInfo,
          errorId: reportedError.errorId,
        });
        this.setState({ reportedError });
      }
    );
  }

  private reloadPage = () => {
    const { reportedError } = this.state;
    this.metrics.track(
      'reloadPage',
      { errorId: reportedError?.errorId },
      () => {
        // eslint-disable-next-line no-self-assign
        window.location.href = window.location.href;
      }
    );
  };

  public render() {
    const { hasError, reportedError } = this.state;
    const { children, t } = this.props;

    if (hasError && reportedError) {
      const { errorId } = reportedError;
      return (
        <ErrorPageContainer>
          <header>
            <Trans t={t} i18nKey="ohNo">
              Oh no!
            </Trans>{' '}
            :(
          </header>
          <p data-testid="error-message">
            <Trans t={t} i18nKey="errorMsg">
              You have encountered an internal error. We have been notified, but
              please reach out to{' '}
              <A
                href={`mailto:support@cognite.com?subject=Error id: ${errorId}`}
              >
                support@cognite.com
              </A>{' '}
              if you are stuck.
            </Trans>
          </p>
          <p data-testid="reload-message">
            <Trans t={t} i18nKey="reloadPage">
              Please try{' '}
              <Button type="link" onClick={this.reloadPage}>
                reloading the page
              </Button>{' '}
              to try again.
            </Trans>
          </p>
          <footer>{errorId}</footer>
        </ErrorPageContainer>
      );
    }

    return children;
  }
}

export default withTranslation('ErrorBoundary')(ErrorBoundary);
