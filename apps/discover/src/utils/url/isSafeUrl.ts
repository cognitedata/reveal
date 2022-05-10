import URL from 'url-parse';

export const isSafeUrl = (dangerousURL: string) => {
  const url = URL(dangerousURL, {});
  if (url.protocol === 'http:') return true;
  if (url.protocol === 'https:') return true;
  return false;
};
