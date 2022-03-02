import URL from 'url-parse';

export const isSafeUrl = (dangerousURL: string) => {
  const url = URL(dangerousURL, {});
  if (url.protocol === 'http:') return true;
  if (url.protocol === 'https:') return true;
  return false;
};

export const openExternalPage = (url: string): void => {
  if (isSafeUrl(url)) {
    window.open(url, '_blank', 'noopener,noreferrer');
  } else {
    console.warn(`Tried to open an unsafe url: ${url}`);
  }
};
