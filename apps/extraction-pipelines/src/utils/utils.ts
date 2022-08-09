// import queryString from 'query-string';
// import { getEnv, getProject } from '@cognite/cdf-utilities';
import { styleScope } from 'styles/styleScope';

export { styleScope } from 'styles/styleScope';

// Use this getContainer for all antd components such as: dropdown, tooltip, popover, modals etc
export const getContainer = () => {
  const els = document.getElementsByClassName(styleScope);
  const el = els.item(0)! as HTMLElement;
  return el;
};
