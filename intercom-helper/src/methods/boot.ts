/* eslint-disable camelcase */
type IntercomSettings = {
  app_id: string;
  name?: string;
  email?: string;
  user_id?: string;
  hide_default_launcher: boolean;
};

export default (settings: IntercomSettings) => {
  if (window.Intercom) {
    window.Intercom('boot', settings);
  }
};
