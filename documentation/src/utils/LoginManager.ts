/*
 * Copyright 2020 Cognite AS
 */

import {
  CogniteClient,
  isLoginPopupWindow,
  loginPopupHandler,
  POPUP,
} from '@cognite/sdk';

const tokenCacheKey = 'cachedAT';
const accessToken = sessionStorage.getItem(tokenCacheKey);

// login manager is merely global state, stored outside of react state,
// because react state is not preserved between mdx examples
class LoginManager {
  isLoggedIn: boolean;
  client: CogniteClient;
  listeners: Array<(isLoggedIn: boolean) => void>

  constructor() {
    this.listeners = [];

    let params = new URL(document.location.toString()).searchParams;
    // id_token in url means we already redirected from auth api
    // so it's safe to mark as logged in, when API call will happen
    // inside demo component - it will be authenticated automatically
    this.isLoggedIn = !!params.get('id_token') || !!accessToken;

    this.client = new CogniteClient({
      appId: 'cognite.reveal.docs.Cognite3DViewer',
    });

    this.client.loginWithOAuth({
      project: '3ddemo',
      accessToken,
      onAuthenticate: POPUP,
      onTokens: (tokens) => {
        sessionStorage.setItem(tokenCacheKey, tokens.accessToken);
      },
    });

    if (isLoginPopupWindow()) {
      loginPopupHandler();
      return;
    }

    this.client.login.status().then((s) => {
      this.isLoggedIn = !!s;
      this.notifyListeners();
    })
  }

  notifyListeners() {
    this.listeners.forEach((fn) => fn(this.isLoggedIn))
  }

  /**
   * @param {Function} fn listener
   * @returns {Function} unsubscribe
   */
  onIsLoggedInChanged(fn: (isLoggedIn: boolean) => void): () => void {
    this.listeners.push(fn)
    return () => {
      this.listeners = this.listeners.filter((f) => f !== fn)
    }
  }

  authenticate() {
    this.client
      .authenticate()
      .then(() => {
        this.isLoggedIn = true;
        this.notifyListeners();
      })
      .catch((e) => console.error(e))
  }
}

export const loginManager = new LoginManager();
