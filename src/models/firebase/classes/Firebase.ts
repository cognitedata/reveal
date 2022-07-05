import AppsApi from 'models/apps-api/classes/AppsApi';
import Config from 'models/charts/config/classes/Config';
import 'firebase/firestore';
import 'firebase/auth';
import firebase from 'firebase/app';

export default class Firebase {
  static get currentUser() {
    return firebase.auth().currentUser;
  }

  static get token() {
    return Config.lsGet('firebaseToken');
  }

  static set token(token: string | undefined) {
    Config.lsSave('firebaseToken', token);
  }

  static async initializeFirebase(
    env: Awaited<ReturnType<typeof AppsApi.fetchFirebaseEnvironment>>,
    firebaseToken: string
  ) {
    if (firebase.apps.length !== 0) {
      // If we're already initialized, don't do it again
      return true;
    }
    firebase.initializeApp(env.firebase);
    await firebase.auth().signInWithCustomToken(firebaseToken);
    return true;
  }

  static async login(
    cogniteApiHost = 'api.cognitedata.com',
    cogniteProject: string,
    accessToken: string
  ) {
    const appsApiUrl = AppsApi.baseUrl(cogniteApiHost);
    const firebaseToken = await AppsApi.fetchFirebaseToken(
      appsApiUrl,
      cogniteProject,
      Config.firebaseAppName,
      accessToken
    );
    const env = await AppsApi.fetchFirebaseEnvironment(
      appsApiUrl,
      cogniteProject,
      Config.firebaseAppName,
      accessToken
    );
    const success = await this.initializeFirebase(env, firebaseToken);
    if (success) {
      this.token = firebaseToken;
      return true;
    }
    return false;
  }
}
