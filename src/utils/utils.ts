import queryString from 'query-string';

import { styleScope } from './styleScope';

export { styleScope } from './styleScope';

// Use this getContainer for all antd components such as: dropdown, tooltip, popover, modals etc
export const getContainer = () => {
  const els = document.getElementsByClassName(styleScope);
  const el = els.item(0)! as HTMLElement;
  return el;
};

export function sleep(ms: number) {
  return new Promise(resolve => {
    setTimeout(() => resolve(ms), ms);
  });
}

export const projectName = () =>
  new URL(window.location.href).pathname.split('/')[1];

export const getCdfEnvFromUrl = () =>
  queryString.parse(window.location.search).env;

export const stringCompare = (a = '', b = '') => {
  const al = a.replace(/\s+/g, '');
  const bl = b.replace(/\s+/g, '');
  return al.localeCompare(bl, 'nb');
};
