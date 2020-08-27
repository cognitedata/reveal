/*!
 * Copyright 2020 Cognite AS
 */

/**
 * Use to determine if the strings that represent urls
 * are pointing on different domains.
 * @param url1
 * @param url2 Optional. Default is `location.origin`. If provided then it must be
 * absolute url to avoid comparison between two relative urls.
 */
export function isTheSameDomain(url1: string, url2: string = location.origin) {
  const isRelative = (url: string) => {
    if (url.startsWith('https://') || url.startsWith('http://') || url.startsWith('//')) {
      return false;
    }
    return true;
  };

  if (isRelative(url2)) {
    throw new Error(`isTheSameDomain: the second argument must be an absolute url or omitted. Received ${url2}`);
  }

  if (isRelative(url1)) {
    return true;
  }

  try {
    const constructedURLs = [new URL(url1), new URL(url2)];
    return constructedURLs[0].origin === constructedURLs[1].origin;
  } catch (e) {
    console.error(`can not create URLs for ${url1} and ${url2}`, e);
    return false;
  }
}
