/*
 * Copyright 2020 Cognite AS
 */

import { CogniteClient, REDIRECT } from '@cognite/sdk';
import { env } from '../env';

const tokenCacheKey = 'cachedAT';
const accessToken = sessionStorage.getItem(tokenCacheKey);

// login manager is merely global state, stored outside of react state,
// because react state is not preserved between mdx examples
class LoginManager {
  isLoggedIn: boolean;
  client: CogniteClient;
  listeners: Array<(isLoggedIn: boolean) => void>;

  constructor() {
    this.listeners = [];
    // might be expired so it's not a guarantee, but good default state
    this.isLoggedIn = !!accessToken;

    this.client = new CogniteClient({
      appId: 'cognite.reveal.docs.Cognite3DViewer',
    });

    // to make it available in examples
    window.sdk = this.client;

    this.client.loginWithOAuth({
      project: env.project,
      accessToken,
      onAuthenticate: REDIRECT,
      onTokens: (tokens) => {
        sessionStorage.setItem(tokenCacheKey, tokens.accessToken);
      },
    });

    this.client.login.status().then((s) => {
      // id_token in url means we already redirected from auth api
      // so it's safe to mark as logged in, when API call will happen
      // inside demo component - it will be authenticated automatically
      if (s && s.project !== env.project) {
        sessionStorage.removeItem(tokenCacheKey);
        this.isLoggedIn = false;
      } else {
        let params = new URL(document.location.toString()).searchParams;
        this.isLoggedIn = !!params.get('id_token') || !!s;
        this.notifyListeners();
      }
    });
  }

  notifyListeners() {
    this.listeners.forEach((fn) => fn(this.isLoggedIn));
  }

  /**
   * @param {Function} fn listener
   * @returns {Function} unsubscribe
   */
  onIsLoggedInChanged(fn: (isLoggedIn: boolean) => void): () => void {
    this.listeners.push(fn);
    return () => {
      this.listeners = this.listeners.filter((f) => f !== fn);
    };
  }

  authenticate() {
    this.client
      .authenticate()
      .then(() => {
        this.isLoggedIn = true;
        this.notifyListeners();
      })
      .catch((e: Error) => console.error(e));
  }
}

export const loginManager = new LoginManager();
