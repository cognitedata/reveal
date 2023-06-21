import { ids } from '@vision/cogs-variables';

import { getProject } from '@cognite/cdf-utilities';

export * from './fetchUntilComplete';

export const projectName = getProject();

// Use this getContainer for all antd components such as: dropdown, tooltip, popover, modals etc
export const getContainer = () => {
  const els = document.getElementsByClassName(ids.styleScope);
  return els.item(0) as HTMLElement;
};
