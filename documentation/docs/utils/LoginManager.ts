/*!
 * Copyright 2021 Cognite AS
 */
import { extractTokensFromUrl,
         generateLoginUrl } from './loginUtils';

import { env } from './env';

// login manager is merely global state, stored outside of react state,
// because react state is not preserved between mdx examples
export class LoginManager {
  readonly isLoggedIn: boolean;
  private token: string | undefined;
  readonly project: string;
  readonly cluster: string;

  constructor(project: string, cluster: string) {
    this.token = this.handleLoginFromRedirect();
    this.isLoggedIn = !!this.token;
    this.project = project;
    this.cluster = cluster;
  }

  private handleLoginFromRedirect() {
    const tokens = extractTokensFromUrl();
    return tokens?.accessToken;
  }

  async getToken(): Promise<string> {
    if (!this.token) {
      await this.loginWithRedirect();
    }

    return this.token!;
  }

  loginWithRedirect(): Promise<void> {
    return new Promise<void>(() => {
      const url = generateLoginUrl({ project: this.project,
                                     baseUrl: `https://${this.cluster}.cognitedata.com`,
                                     redirectUrl: window.location.href });

      window.location.assign(url);
    });
  }
}

export const loginManager = new LoginManager(env.project, env.cluster);
