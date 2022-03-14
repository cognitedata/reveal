/* eslint-disable @typescript-eslint/no-unused-vars-experimental */
import React from 'react';
import { ErrorPlaceholder } from './ErrorPlaceholder';

interface IProps {
  children?: any;
}

interface ErrorBoundaryState {
  hasError: boolean;
}

export class ErrorBoundary extends React.Component<IProps, ErrorBoundaryState> {
  constructor(props: IProps) {
    super(props);
    this.state = { hasError: false };
  }

  static getDerivedStateFromError(error: any) {
    return { hasError: true };
  }

  componentDidCatch(error: any, errorInfo: any) {
    // Errors are logged in with sentry
    console.error(error, errorInfo);
  }

  render() {
    if (this.state.hasError) {
      return <ErrorPlaceholder />;
    }
    return this.props.children;
  }
}
