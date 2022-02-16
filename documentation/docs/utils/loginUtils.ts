/*!
 * Copyright 2022 Cognite AS
 */

import { parse, stringify } from 'query-string';

function clearParametersFromUrl(...params: string[]): void {
  let url = window.location.href;
  params.forEach(param => {
    url = removeQueryParameterFromUrl(url, param);
  });
  window.history.replaceState(null, '', url);
}

function removeQueryParameterFromUrl(
  url: string,
  parameter: string
): string {
  return url
    .replace(new RegExp('[?#&]' + parameter + '=[^&#]*(#.*)?$'), '$1')
    .replace(new RegExp('([?#&])' + parameter + '=[^&]*&'), '$1');
}

const ACCESS_TOKEN_PARAM = 'access_token';
const ID_TOKEN_PARAM = 'id_token';
const ERROR_PARAM = 'error';
const ERROR_DESCRIPTION_PARAM = 'error_description';

interface AuthTokens {
  accessToken: string;
  idToken: string;
}

function parseTokenQueryParameters(query: string): null | AuthTokens {
  const {
    [ACCESS_TOKEN_PARAM]: accessToken,
    [ID_TOKEN_PARAM]: idToken,
    [ERROR_PARAM]: error,
    [ERROR_DESCRIPTION_PARAM]: errorDescription,
  } = parse(query);
  if (error !== undefined) {
    throw Error(`${error}: ${errorDescription}`);
  }
  if (typeof(accessToken) === 'string' && typeof(idToken) === 'string') {
    return {
      accessToken,
      idToken
    };
  }
  return null;
}
export function generateLoginUrl(params: {
  project: string,
  baseUrl: string,
  redirectUrl: string,
  errorRedirectUrl?: string }): string {
  const { project, baseUrl, redirectUrl, errorRedirectUrl } = params;
  const queryParams = {
    project,
    redirectUrl,
    errorRedirectUrl: errorRedirectUrl || redirectUrl,
  };
  return `${baseUrl}/login/redirect?${stringify(queryParams)}`;
}

export function extractTokensFromUrl() {
  try {
    const tokens = parseTokenQueryParameters(window.location.search);
    clearParametersFromUrl(ACCESS_TOKEN_PARAM, ID_TOKEN_PARAM);
    return tokens;
  } catch (err) {
    clearParametersFromUrl(ERROR_PARAM, ERROR_DESCRIPTION_PARAM);
    throw err;
  }
}
