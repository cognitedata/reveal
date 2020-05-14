/*!
 * Copyright 2020 Cognite AS
 */

export function getUrlParameter(parameter: string): string | null {
  const url = new URL(location.href);
  return url.searchParams.get(parameter);
}
