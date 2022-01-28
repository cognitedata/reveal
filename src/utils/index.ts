import { getProject } from '@cognite/cdf-utilities';
import { ids } from 'src/cogs-variables';

export * from './fetchUntilComplete';

export const projectName = getProject();

// Use this getContainer for all antd components such as: dropdown, tooltip, popover, modals etc
export const getContainer = () => {
  const els = document.getElementsByClassName(ids.styleScope);
  const el = els.item(0)! as HTMLElement;
  return el;
};
