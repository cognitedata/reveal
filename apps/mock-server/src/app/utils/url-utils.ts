import { config } from '../config';

export function getEndpointEnding(url: string): string | undefined {
  const whitelistedEndpointEndings = config.whitelistedEndpointEndings;

  if (shouldUrlBeIgnored(url)) {
    return undefined;
  }

  const endpointEnding = whitelistedEndpointEndings.find((sufix) =>
    url.endsWith(sufix)
  );

  return endpointEnding;
}

export function shouldUrlBeIgnored(url: string) {
  return config.ignoreUrlPatterns.some((rx) => {
    const regexp = new RegExp(rx, 'gmi');
    return regexp.test(url);
  });
}
