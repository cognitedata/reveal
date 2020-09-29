import React from 'react';
import { isProduction } from 'utils/environment';

type Props = {
  children: React.ReactNode;
};

export default class ErrorBoundary extends React.Component<Props> {
  state: any;

  constructor(props: Props) {
    super(props);
    this.state = {
      hasError: false,
      error: undefined,
    };
  }

  static getDerivedStateFromError(error: any) {
    // Update state so the next render will show the fallback UI.
    return { hasError: true, error };
  }

  render() {
    const inProduction = isProduction();
    if (this.state.hasError) {
      // You can render any custom fallback UI
      return (
        <>
          <h1>Something went wrong.</h1>
          <pre>{this.state.error?.message}</pre>
          {!inProduction && <pre>{this.state.error?.stack}</pre>}
        </>
      );
    }

    return this.props.children;
  }
}
