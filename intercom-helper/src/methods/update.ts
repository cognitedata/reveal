/* eslint-disable camelcase */
import { IntercomUpdateSettings, ForbiddenUpdateKey } from '../types';

const forbiddenKeys: ForbiddenUpdateKey = {
  user_id: true,
};

export default (settings: IntercomUpdateSettings) => {
  if (window.Intercom && Object.keys(settings).length > 0) {
    const parsedSettings: IntercomUpdateSettings = {};

    Object.keys(settings).forEach((key): void => {
      if (!forbiddenKeys[key]) {
        parsedSettings[key] = settings[key];
      }
    });

    window.Intercom('update', parsedSettings);
  }
};
