import { IntercomBootSettings } from '../types';

export default (settings: IntercomBootSettings): void => {
  if (window.Intercom) {
    window.Intercom('boot', settings);
  }
};
