import { IntercomBootSettings } from '../types';

export default (settings: IntercomBootSettings) => {
  if (window.Intercom) {
    window.Intercom('boot', settings);
  }
};
