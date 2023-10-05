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
