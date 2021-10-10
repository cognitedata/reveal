/*!
 * Copyright 2021 Cognite AS
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
    if (url.match(/^.*\/\//)) {
      return false; // starts with protocol - means absolute url, e.g. https://foo.bar/baz
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
    // url that starts with '//' considered invalid for URL constructor
    // but browsers usually work just fine with them when it comes to links
    // and we just need to compare origins here anyway
    const urls = [url1, url2].map(url => (url.startsWith('//') ? 'https:' + url : url));

    const constructedURLs = urls.map(url => new URL(url));
    return constructedURLs[0].host === constructedURLs[1].host;
  } catch (e) {
    console.error(`can not create URLs for ${url1} and ${url2}`, e);
    return false;
  }
}
