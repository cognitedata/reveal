import { Component, ComponentClass } from 'react';
import {
  withAITracking,
  useAppInsightsContext,
  useTrackEvent,
} from '@microsoft/applicationinsights-react-js';
import { RouteComponentProps } from 'react-router';

import { AzureTelemetryOptions, telemetryService } from './TelemetryService';

type PropsType = RouteComponentProps & {
  instrumentationKey?: string;
  children?: React.ReactNode;
  history: History;
  options?: AzureTelemetryOptions;
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
      telemetryService.initialize(
        history,
        appInsightsInstrumentationKey,
        this.props.options || {}
      );
      this.setState({ initialized: true });
    }
  }

  render() {
    return this.props.children;
  }
}

const WithAITracking = withAITracking(
  telemetryService.reactPlugin,
  TelemetryProvider
);

export const AzureTelemetryProvider =
  WithAITracking as unknown as ComponentClass<
    Pick<PropsType, 'instrumentationKey' | 'children' | 'options'>,
    any
  >;

export const useAzureTrackEvent = (eventName: string, eventData?: unknown) => {
  const appInsights = useAppInsightsContext();

  const customTracker = useTrackEvent(appInsights, eventName, eventData);

  return customTracker;
};
