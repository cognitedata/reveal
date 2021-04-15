/* eslint-disable @typescript-eslint/no-explicit-any */
import intercomInitialization from './core/initialization';
import intercomHelper from './methods';

declare global {
  interface Window {
    Intercom: any;
    intercomSettings: Record<string, any>;
    attachEvent: (arg0: string, arg1: () => void) => void;
  }
}

export { intercomHelper, intercomInitialization };
