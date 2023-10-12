import { getProject } from '@cognite/cdf-utilities';

import { ids } from '../cogs-variables';

export * from './fetchUntilComplete';

export const projectName = getProject();

// Use this getContainer for all antd components such as: dropdown, tooltip, popover, modals etc
export const getContainer = () => {
  const els = document.getElementsByClassName(ids.styleScope);
  return els.item(0) as HTMLElement;
};
