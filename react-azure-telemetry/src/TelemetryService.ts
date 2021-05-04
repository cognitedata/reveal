import { ApplicationInsights } from '@microsoft/applicationinsights-web';
import { ReactPlugin } from '@microsoft/applicationinsights-react-js';
import { History } from 'history';

const reactPlugin: ReactPlugin = new ReactPlugin();
let appInsights: ApplicationInsights | null = null;

/**
 * Create the App Insights Telemetry Service
 * @return {{reactPlugin: ReactPlugin, appInsights: Object, initialize: Function}} - Object
 */
const createTelemetryService = () => {
  /**
   * Initialize the Application Insights class
   * @param {string} instrumentationKey - Application Insights Instrumentation Key
   * @param {Object} browserHistory - client's browser history, supplied by the withRouter HOC
   * @return {void}
   */
  const initialize = (browserHistory: History, instrumentationKey?: string) => {
    if (!browserHistory) {
      throw new Error('Could not initialize Telemetry Service');
    }
    if (!instrumentationKey) {
      throw new Error('Instrumentation key not provided for tenant');
    }

    appInsights = new ApplicationInsights({
      config: {
        instrumentationKey,
        maxBatchInterval: 0,
        disableFetchTracking: false,
        extensions: [reactPlugin],
        extensionConfig: {
          [reactPlugin.identifier]: {
            history: browserHistory,
          },
        },
        enableDebug: true,
        loggingLevelConsole: 2,
        loggingLevelTelemetry: 2,
      },
    });

    appInsights.loadAppInsights();
  };

  return { reactPlugin, appInsights, initialize };
};

export const telemetryService = createTelemetryService();
export const getAppInsights = () => {
  return appInsights;
};
