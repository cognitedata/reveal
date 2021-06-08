import { Component } from 'react';
import { withAITracking } from '@microsoft/applicationinsights-react-js';
import { withRouter } from 'react-router-dom';
import { RouteComponentProps } from 'react-router';

import { telemetryService } from './TelemetryService';

type PropsType = RouteComponentProps & {
  instrumentationKey?: string;
  children: React.ReactNode;
  history: History;
};

type State = {
  initialized: boolean;
};

/**
 * This Component provides telemetry for Azure Application Insights
 *
 * NOTE: the package '@microsoft/applicationinsights-react-js' has a HOC withAITracking
 * that requires this to be a Class Component rather than a Functional Component
 */
class TelemetryProvider extends Component<PropsType, State> {
  constructor(props: PropsType) {
    super(props);
    this.state = {
      initialized: false,
    };
  }

  componentDidMount() {
    const { history } = this.props;
    const { initialized } = this.state;

    const appInsightsInstrumentationKey = this.props.instrumentationKey;
    if (!initialized && appInsightsInstrumentationKey && history) {
      telemetryService.initialize(history, appInsightsInstrumentationKey);
      this.setState({ initialized: true });
    }
  }

  render() {
    return this.props.children;
  }
}

export const AzureTelemetryProvider = withRouter(
  withAITracking(telemetryService.reactPlugin, TelemetryProvider)
);
