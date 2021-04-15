/* eslint-disable camelcase, @typescript-eslint/no-explicit-any */

/*
 ** [keys: string] keys are used here to allow for object[key] notation
 */
type IntercomUpdateSettings = {
  name?: string;
  email?: string;
  hide_default_launcher?: boolean;
  horizontal_padding?: number;
  [keys: string]: any;
};

type ForbiddenKey = {
  user_id: boolean;
  [keys: string]: boolean;
};

const forbiddenKeys: ForbiddenKey = {
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
