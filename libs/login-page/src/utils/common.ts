import { styleScope } from '../styles/styleScope';

export const getContainer = () => {
  const els = document.getElementsByClassName(styleScope);
  const container = els.item(0);
  if (!container) {
    throw new Error(`Couldn't find container for style scope ${styleScope}`);
  }
  return container as HTMLElement;
};

export const parseDirectoryFromAuthority = (authority: string) => {
  const splits = authority.split('/');

  return splits[splits.length - 1];
};

export const getRootDomain = () =>
  window.location.host.split('.').slice(1).join('.');

export const redirectToSelectDomainPage = () => {
  window.location.host = getRootDomain();
};

export const redirectTo = (domain: string) => {
  window.location.host = `${domain}.${getRootDomain()}`;
};

export const parseRef = (search: string): [string, Record<string, string>] => {
  const searchParams = new URLSearchParams(search);

  const refPath = searchParams.get('path') ?? '';
  const refSearch = searchParams.get('search') ?? '';
  const extraParams: Record<string, string> = {};

  new URLSearchParams(refSearch).forEach((value, key) => {
    extraParams[key] = value;
  });

  return [refPath, extraParams];
};
