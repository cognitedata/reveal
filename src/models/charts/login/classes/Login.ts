import Config from 'models/charts/config/classes/Config';

export default class Login {
  static get firebaseToken() {
    return Config.lsGet('firebaseToken', '');
  }

  static set firebaseToken(token: string) {
    Config.lsSave('firebaseToken', token);
  }

  static get cdfToken() {
    return Config.lsGet('cdfToken', '');
  }

  static set cdfToken(token: string) {
    Config.lsSave('cdfToken', token);
  }

  static get accessToken() {
    return Config.lsGet('accessToken', '');
  }

  static set accessToken(token: string) {
    Config.lsSave('accessToken', token);
  }
}
