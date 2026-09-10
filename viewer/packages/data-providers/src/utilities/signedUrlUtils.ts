/*!
 * Copyright 2026 Cognite AS
 */

/**
 * Strips the "restricted-api" gateway prefix from signed URL hostnames.
 * E.g. https://restricted-api.storage.cognite.com/... -> https://storage.cognite.com/...
 */
export function stripRestrictedApiGateway(url: string): string {
  return url.replace(/^(https?:\/\/)restricted-api\./, '$1');
}
