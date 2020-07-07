/*!
 * Copyright 2020 Cognite AS
 */
declare module '*.jpeg' {
  const value: any;
  export = value;
}

declare global {
  namespace NodeJS {
    interface ProcessEnv {
      VERSION: string;
      MIXPANEL_TOKEN: string;
    }
  }
}

// If this file has no import/export statements (i.e. is a script)
// convert it into a module by adding an empty export statement.
export {};
