import { createLink } from '@cognite/cdf-utilities';

import { styleScope } from 'styles/styleScope';

export const getContainer = () => {
  const els = document.getElementsByClassName(styleScope);
  const el = els.item(0)! as HTMLElement;
  return el;
};

export const createInternalLink = (path?: string | number) => {
  const mountPoint = window.location.pathname.split('/')[2];
  return createLink(`/${mountPoint}/${path || ''}`);
};

export const stringCompare = (a = '', b = '') => {
  const al = a.replace(/\s+/g, '');
  const bl = b.replace(/\s+/g, '');
  return al.localeCompare(bl, 'nb');
};
