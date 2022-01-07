import { getProject } from '@cognite/cdf-utilities';
import { styleScope } from './styleScope';

export { default as zIndex } from './zIndex';

export * from './styles';
export * from './notifications';
export * from './revealUtils';
export * from './queryKeys';
export * from './sdk/3dApiUtils';
export * from './sortNaturally';
export * from './sleep';

export { styleScope } from './styleScope';

export const APP_TITLE = '3D models';

export const projectName = getProject();

// Use this getContainer for all antd components such as: dropdown, tooltip, popover, modals etc
export const getContainer = () => {
  const els = document.getElementsByClassName(styleScope);
  const el = els.item(0)! as HTMLElement;
  return el;
};
