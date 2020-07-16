import React, { ErrorInfo } from 'react';
import styled from 'styled-components/macro';
import { withTranslation, Trans, WithTranslation } from 'react-i18next';
import { Metrics } from '@cognite/metrics';
import { A, Button } from '@cognite/cogs.js';

import { reportException, ReportedError } from '../reportException';

const ErrorPage = styled.div`
  color: var(--cogs-greyscale-grey5);
  display: flex;
  flex-direction: column;
  text-align: center;
  justify-content: center;
  height: 100%;
  padding: 10vw;

  header {
    font-size: 32px;
    font-weight: bold;
    margin-bottom: 24px;
  }

  p {
    font-size: 24px;
  }

  button {
    font-size: inherit;
  }
`;

type State = {
  reportedError: ReportedError | null;
  hasError?: boolean;
};

type Props = WithTranslation & {
  children: React.ReactNode;
  instanceId: string;
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
        window.location.reload();
      }
    );
  };

  public render() {
    const { hasError, reportedError } = this.state;
    const { children, t } = this.props;

    if (hasError && reportedError) {
      const { errorId } = reportedError;
      return (
        <ErrorPage>
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
        </ErrorPage>
      );
    }

    return children;
  }
}

export default withTranslation('ErrorBoundary')(ErrorBoundary);
