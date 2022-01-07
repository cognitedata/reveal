/*!
 * Copyright 2022 Cognite AS
 */
import { MetricsLogger } from '@reveal/metrics';

declare module '*.jpeg' {
  const value: any;
  export = value;
}

declare global {
  // Global variables will only be usable if they are declared with var
  // eslint-disable-next-line no-var
  var revealMetricsLogger: { metricsLogger: MetricsLogger };

  namespace NodeJS {
    interface ProcessEnv {
      VERSION: string;
      WORKER_VERSION: string;
      MIXPANEL_TOKEN: string;
      IS_DEVELOPMENT_MODE: boolean;
    }
  }
}

// If this file has no import/export statements (i.e. is a script)
// convert it into a module by adding an empty export statement.
export {};
