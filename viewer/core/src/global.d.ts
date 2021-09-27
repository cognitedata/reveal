/*!
 * Copyright 2021 Cognite AS
 */
declare module '*.jpeg' {
  const value: any;
  export = value;
}

declare global {
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
